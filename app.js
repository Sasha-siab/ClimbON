const express = require('express')
const https = require('https');
const ejs = require('ejs')
const multer = require('multer')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const {Client} = require('pg')
const Sequelize = require('sequelize')
const passport = require('passport');
const Strategy = require('passport-local').Strategy;

const PORT = process.env.PORT || 3000
const app = express();

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('public'))

const dotenv = require('dotenv')
const result = dotenv.config();

dotenv.load();

const postgres_user = process.env.DB_USER;
const postgres_pass = process.env.DB_PASS;


const client = new Client({ connectionString:process.env.DB_URL, ssl: true})



// ------------------------------------------------------- VARS

var errHolder = '';
var realData;

var states = ["Alaska","Alabama","Arkansas","American Samoa","Arizona","California","Colorado","Connecticut","District of Columbia","Delaware","Florida","Georgia","Guam","Hawaii","Iowa","Idaho","Illinois","Indiana","Kansas","Kentucky","Louisiana","Massachusetts","Maryland","Maine","Michigan","Minnesota","Missouri","Mississippi","Montana","North Carolina","North Dakota","Nebraska","New Hampshire","New Jersey","New Mexico","Nevada","New York","Ohio","Oklahoma","Oregon","Pennsylvania","Puerto Rico","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Virginia","Virgin Islands","Vermont","Washington","Wisconsin","West Virginia","Wyoming"];



// ------------------------------------------------------- DROPDOWN MENU



// ------------------------------------------------------- SEQUELIZE

const Op = Sequelize.Op
const sequelize = new Sequelize('climbin', 'postgres', 'branka123', {

	host: 'localhost',
	port: '5432',
	dialect: 'postgres',
	operatorsAliases:{
		$and: Op.and,
		$or: Op.or,
		$eq: Op.eq,
		$like: Op.like,
		$iLike: Op.iLike
	}
})


//_________________________________________________________CREATE A TABLE

const User = sequelize.define('user',
  {
	username: Sequelize.STRING,
	fname: Sequelize.STRING,
	lname: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING

  }
);

const Favorite = sequelize.define('favorite',
	{
		username: Sequelize.STRING,
		content: Sequelize.STRING
	}

);

sequelize.sync();


// ------------------------------------------------------- CREATE A RECORD

 // User.create({

    // username: sasha_siab,
    // fname: sasha,
	// lname: siabriuk,
	// email: alexsbrk91@gmail.com,
	// password: password


 // });



// ----------------------------------------------------------- PASSPORT JS

app.use(cookieParser());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

passport.use(new Strategy(

	(username, password, cb)=>{
		console.log('Strategy')
		User.findOne({
			where: {
				username: {
					$iLike : `${username}`
				}
			}
		}).then(data=>{
			if (!data) {
				return cb(null,false);
			} else if (data.password !== password) {
				return cb(null,false);
			}
			return cb(null,data);
		});
	}
));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user,cb){
	cb(null, user.id);
});

passport.deserializeUser(function(id,cb){
	User.findById(id).then(data=>{
		if(!data) {
			return cb(null,null);
		}
		cb(null,data);
	});

});


// ____________________________________________________________________________LOG OUT


app.get('/logout',(req,res)=>{
	// req.logout();
	res.redirect('/signup');
});



// ____________________________________________________________________________SIGN IN | UP

app.get('/signup',(req,res)=>{

	  res.render('login',{errHolder});

	});


 // ____________________________________________________________________________LOGIN


app.post('/login', passport.authenticate('local', {failureRedirect: '/signup'}), (req,res)=>{
	console.log('i fired')
			res.redirect('/');

	});

// ____________________________________________________________________________REGISTER

app.post('/register', (req,res)=>{

	let data = req.body;

	if (data.password !== data.password2) {
		errHolder = 'Password Data does not match, try again'
		return res.render('login',{errHolder})
	} else if (data.username == '' ||data.fname == '' || data.lname == '' || data.email == '' || data.password == '' || data.password2 == '') {
		errHolder = 'Please enter values for each feild'
		return res.render('login',{errHolder});
	}

	User.findOne({
		where: {
			email: {
				$like: `${data.email}`
			}
		}

	}).then(existingEmail=>{
		console.log(data);
		if (existingEmail) {
			errHolder = 'we already have an account with this email';
			emailSafe = false;
			return res.render('login',{errHolder});
		} else {
			console.log('email safe');
			User.create({
					username: data.username,
					fname: data.fname,
					lname: data.lname,
					email: data.email,
					password: data.password

			}).then(x=>{
				var newUserData = x;

				Favorite.create({
					username: data.username,
					content: ''
				}).then(x=>{
					console.log(x.dataValues.username);
					return res.redirect(`/processing/${newUserData.dataValues.username}&${newUserData.dataValues.password}`);
				});

			});
		}
	});

});






// ____________________________________________________________________________CONFIRMATION PAGE SIGN UP


app.get('/processing/:username&:password', (req,res)=>{
	console.log('hello processing');
	res.render('confirmation',{data:req.params})
})

app.post('/newUserLogin',passport.authenticate('local', {failureRedirect: '/signup'}), (req,res)=>{
	res.redirect('/');
})



// ---------------------------------------------------- API KEYS

app.get('/', require('connect-ensure-login').ensureLoggedIn('/signup'), (req, res)=>{


// ____________________________________________________________________________ GET MY TO-DOS



// console.log(req.user.username)

https.get('https://www.mountainproject.com/data/get-to-dos?email=alexsbrk91@gmail.com&key=200243352-e1032796c183b3f14287ddd2faec242c', (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
  	let dataRoutes = JSON.parse(data).toDos
  	let newData = ''
		console.log(`${dataRoutes.join(',')} are my data routes to be searched`);
		let parsedRouteString = dataRoutes.join(',');
  	https.get(`https://www.mountainproject.com/data/get-routes?routeIds=${dataRoutes.join(',')}&key=200243352-e1032796c183b3f14287ddd2faec242c`, (resp2) => {


			resp2.on('data', (chunk) => {
					console.log('first data check');
					// console.log(chunk);
		    newData += chunk;
		  });
		  resp2.on('end', ()=>{
				console.log('end of the line');
		  	// console.log(JSON.parse(dataRoutes));
		  	realData = JSON.parse(newData)['routes'];
		  	// for (var i = eachRoute.length - 1; i >= 0; i--) {
		  	// 	// console.log(eachRoute[i].name);
		  	// 	console.log(eachRoute[i].location[0]);

		  		// console.log(realData);
   				 res.render('home',{errHolder:'', data:realData, states:states, username:req.user.username});
		  	// }
		  });
		});

  });

}).on("error", (err) => {
  console.log('error function')
  console.log("Error: " + err.message);
});


});

// ____________________________________________________________________________SEARCH FORM


app.post('/searchForm', (req,res)=>{

	var routeLocation= req.body.routeLocation;
	routeLocation = routeLocation.split('%20').join(' ');
	var routeType = req.body.routeType;
	var result = [];

	function locationFilter(arr) { 
		let container = [];
		for (var i = arr.length - 1; i >= 0; i--) {
			if (arr[i].location[0] === routeLocation) {
				container.push(arr[i]);
			}
		}
		return container;
	}

	function typeFilter(arr) {
		let container = [];
		for (var i = arr.length - 1; i >= 0; i--) {
			console.log(arr[i].type)
			if (arr[i].type === req.body.routeType) {
				container.push(arr[i]);
			}
		}
		return container
	}

	// console.log('search!!')


	console.log('------------------------------------------------------------------------------------------');
	console.log(routeLocation); 
	console.log('------------------------------------------------------------------------------------------');


	if (req.body.routeLocation !== "false" && req.body.routeType !== "false") {

		if (realData) {
			result.push(locationFilter(realData));
			console.log('filter 1 runs with result following');
			console.log(result)
			result = typeFilter(result[0]);
			console.log('filter 2 runs with result following');
			console.log(result)
		} else {
			console.log('no data')
			var awaitData = setTimeout(function(){
				if (realData) {
					result.push(locationFilter(realData));
					result = typeFilter(result[0]);
					clearTimeout(awaitData);
				}
			},2000)
		}

		if (result[0]===undefined) {
			return res.render('home', {errHolder:'Oppps, we have no routes. Please check the Moutian Project website for more options.', data:false, states:states});
		}
		return res.render('home', {errHolder:'', data:result, states:states});

	}

	if (req.body.routeLocation !== "false") {

		if (realData) {
			result.push(locationFilter(realData))
		} else {
			console.log('no data')
			var awaitData = setTimeout(function(){
				if (realData) {
					result.push(locationFilter(realData))
					clearTimeout(awaitData);
				}
			},2000)
		}
		console.log(result[0])
		if (result[0][0]===undefined) {
			return res.render('home', {errHolder:'Oppps.... We have no routes. Please check the Mountain Project website for more options.', data:false, states:states});
		}
		return res.render('home', {errHolder:'', data:result[0], states:states});

	}

	if (req.body.routeType !== "false") {

		if (realData) {
			result.push(typeFilter(realData))
		} else {
			console.log('no data')
			var awaitData = setTimeout(function(){
		if (realData) {
				result.push(typeFilter(realData))
				clearTimeout(awaitData);
			}
		},2000);
	}

		if (result[0][0]===undefined) {
			return res.render('home', {errHolder:'Oppps.... We have no routes. Please check the Mountain Project website for more options.', data:false, states:states});
		}
		return res.render('home', {errHolder:'', data:result[0], states:states});

	}

	// console.log(result);

})


// ____________________________________________________________________________FAVORITES ROUTE



app.post('/favorites/:routeId',(req,res)=>{

	var newFavorite = req.params.routeId;


	Favorite.findOne({

		where: {
			username: {
				$iLike: `${req.user.username}`
			}
		}
	}).then(user=>{

		let newArray;

		if (user.dataValues.content.length === 0) {

			newArray = [newFavorite];
			console.log('new!')

		} else {

			newArray = (user.dataValues.content).split(',');
			newArray.push(newFavorite);
			newArray = newArray.join(',');
			console.log(newArray);

		}
		newArray = newArray.toString();
		user.updateAttributes({
			content: newArray
		}).then(x=>{
			res.redirect(`/`);
		});

	})

});







app.get('/favorites',require('connect-ensure-login').ensureLoggedIn('/signup'),(req,res)=>{
	console.log(req.params.userId);


	Favorite.findOne({
		where: {
			username: {
				$iLike: req.user.username
			}
		}
	}).then(data=>{
		console.log(data);

		console.log('------------------------- get user ------------------');
		// console.log(data.dataValues);
		// console.log(data['dataValues'])
		var favorites = data.dataValues.content;
		// favorites = favorites.split(',');
		console.log(data.dataValues.content)
		res.render('favorites', {favData:favorites});



	})
})





app.listen(PORT, ()=>{
	console.log( "port running away from Sasha on 3000")
})

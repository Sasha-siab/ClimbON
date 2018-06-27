
const https = require('https');


let hello = function(req,res,render,states){
	console.log('hello')

// ---------------------------------------------------- MY TO_DO'S
var realData;


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
					console.log(chunk);
		    newData += chunk;
		  });
		  resp2.on('end', ()=>{
				console.log('end of the line');
		  	// console.log(JSON.parse(dataRoutes));
		  	// for (var i = eachRoute.length - 1; i >= 0; i--) {
		  	// 	// console.log(eachRoute[i].name);
		  	// 	console.log(eachRoute[i].location[0]);

		  		console.log(realData);
		  		// console.log(states)
   				 res.render(render,{errHolder:'', data:realData, states:states});
		  	// }
		  });
		});

  });

}).on("error", (err) => {
  console.log('error function')
  console.log("Error: " + err.message);
});


}

module.exports = {hello:hello}
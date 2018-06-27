
$('document').ready(function(){

	var dataRoutes = $('.item').text();
	dataRoutes = '[' + dataRoutes + ']';
	console.log(dataRoutes);
	$.ajax({
	   url: `https://www.mountainproject.com/data/get-routes?routeIds=${dataRoutes}&key=200243352-e1032796c183b3f14287ddd2faec242c`,
	   data: {
	      format: 'json'
	   },
	   error: function() {
	      $('#hiddenWrapper').html('<p>nop... not working</p>');
	      console.log('__________________________A')
	   },
	   success: function(data) {
	   	console.log('ajax')
	   	console.log(data);
	   	for (let i = 0; i < data.routes.length; i++) {

	   		let html = '';
	   		let thisRoute = data.routes[i];
	   		
	   		html += `
	   		<div class="item">
	   			<div class="imgContainer"> <img class="route-img" src="${thisRoute.imgMedium}"> </div>
	   			<h1 class="route-name">${thisRoute.name}</h1><br/>
	   			<span class="route-location">Location: ${thisRoute.location[0]}</span><br/>
	   			<span class="route-type">Style: ${thisRoute.type}</span><br/>
	   			<span class="route-rating">Rating: ${thisRoute.rating}</span><br/>
	   			<span class="route-pitches">Pitches: ${thisRoute.pitches}</span><br/>
	   			<a class="route-url" href="${thisRoute.url}">Get more information</a><br/>
	   		</div>

	   		`

	   		$('.favorites_container').append(html);

	   	}
	   

	   }
	});




})




 

 
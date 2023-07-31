//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
	//map frame dimensions
	var width = 940,
		height = 500;
	
	//create new svg container for the map
	var map = d3.select("body")
	.append("svg")
	.attr("class", "map")
	.attr("width", width)
	.attr("height", height);
	
	//create Albers equal area conic projection centered on wales
	var projection = d3.geoAlbers()
	.center([-5.5, 52.4])
	.rotate([-2, 0])
	.parallels([51, 53])
	.scale(12000)
	.translate([width / 2, height / 2]);
	
	var path = d3.geoPath()
		.projection(projection);
	
	//use Promise.all to parallelize asynchronous data loading
	var promises = []; 
	promises.push(d3.csv("data/WalesData.csv")); //load attributes from csv 
	promises.push(d3.json("data/EuropeCountries2.topojson")); //load background spatial data 
	promises.push(d3.json("data/WalesRegions.topojson")); //load choropleth spatial data 
	Promise.all(promises).then(callback);
	
	function callback(data) {
		var csvData = data[0],
			europe = data[1],
			wales = data[2];

		//translate europe TopoJSON
		var europeCountries = topojson.feature(europe, europe.objects.EuropeCountries),
			walesRegions = topojson.feature(wales, wales.objects.Wales).features;
		
		//create graticule generator
		var graticule = d3.geoGraticule()
		.step([2, 2]); //place graticule lines every 5 degrees of longitude and latitude
		
		//create graticule background
		var gratBackground = map.append("path")
			.datum(graticule.outline()) //bind graticule background
			.attr("class", "gratBackground") //assign class for styling
			.attr("d", path) //project graticule
		
		//create graticule lines
		var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
		.data(graticule.lines()) //bind graticule lines to each element to be created
		.enter() //create an element for each datum
		.append("path") //append each element to the svg as a path element
		.attr("class", "gratLines") //assign class for styling
		.attr("d", path); //project graticule lines
		
		//add Europe countries to map
		var countries = map.append("path")
			.datum(europeCountries)
			.attr("class", "countries")
			.attr("d", path);

		//add wales regions to map
		var regions = map.selectAll(".regions")
			.data(walesRegions)
			.enter()
			.append("path")
			.attr("class", function(d){
				return "regions " + d.properties.name;
			})
			.attr("d", path);
	};
};
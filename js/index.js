const projectName = 'tree-map';
localStorage.setItem('example_project', 'D3: Tree Map');

const schemeCategory20 = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];

const KickstarterPledgesURL = './json/kickstarter-funding-data.json';
const MovieSalesURL = './json/movie-data.json';
const VideoGameSalesURL = './json/video-game-sales-data.json';

const dataset = {};
var datasetName = 'KickstarterPledges';

const w = 1032;
const h = 1000;
const legendH = 100;

var tooltip;
var svg;

const colorScale = d3.scaleOrdinal()
								.range(schemeCategory20);

document.addEventListener('DOMContentLoaded', function(event) {
	tooltip = d3.select('body')
								.append('div')
								.attr('id', 'tooltip');

	svg = d3.select('#canvas')
								.append('svg')
								.attr('width', w)
								.attr('height', h);

	Promise.all([KickstarterPledgesURL, MovieSalesURL, VideoGameSalesURL].map(url => d3.json(url))).then(function(data) {
		dataset['KickstarterPledges'] = data[0];
		dataset['KickstarterPledges']['title'] = 'Kickstarter Pledges';
		dataset['KickstarterPledges']['description'] = 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category';
		dataset['MovieSales'] = data[1];
		dataset['MovieSales']['title'] = 'Movie Sales';
		dataset['MovieSales']['description'] = 'Top 100 Highest Grossing Movies Grouped By Genre';
		dataset['VideoGameSales'] = data[2];
		dataset['VideoGameSales']['title'] = 'Video Game Sales';
		dataset['VideoGameSales']['description'] = 'Top 100 Most Sold Video Games Grouped by Platform';

		createTreemap(datasetName);

		let selectors = document.getElementsByName('dataset');
		selectors.forEach(function(element) {
			element.onclick = function(event) {
				datasetName = this.value;
				createTreemap(datasetName);
			};
		});
	});
});

function createTreemap(datasetName = 'KickstarterPledges') {
	document.getElementById('description').innerHTML = dataset[datasetName]['title'] + ': ' + dataset[datasetName]['description'];
	svg.html('');

	const treemap = d3.treemap()
								.size([w, h-legendH]);

	const tree = d3.hierarchy(dataset[datasetName])
								.sum(d => d['value'])
								.sort((a, b) => b.height - a.height || b.value - a.value);

	treemap(tree);

	const legend = svg.append('g')
								.attr('id', 'legend')
								.attr('transform', 'translate(' + (w / 10.7) + ', 0)');

	let categories = tree.leaves().map(e => e['data']['category']).filter((value, index, self) => self.indexOf(value) === index);

	const legendRectSize = 15;
	const legendHSpace = 150;
	const legendVSpace = 10;
	const legendElementsPerRow = Math.floor(w / legendHSpace);

	let legendElement = legend.selectAll('g')
								.data(categories)
								.enter()
								.append('g')
								.attr('transform', (d, i) => 'translate(' + ((i % legendElementsPerRow) * legendHSpace) + ', ' + ((Math.floor(i / legendElementsPerRow)) * legendRectSize + (legendVSpace * (Math.floor(i / legendElementsPerRow)))) + ')');

	legendElement.append('rect')
	.attr('class', 'legend-item')
	.attr('width', legendRectSize)
	.attr('height', legendRectSize)
	.attr('fill', (d) => colorScale(d));

	legendElement.append('text')
	.attr('x', legendRectSize + 3)
	.attr('y', legendRectSize - 2)
	.text(d => d);

	let treeMap = svg.append('g')
								.attr('id', 'tree-map')
								.attr('transform', 'translate(0, ' + (legendH + 10) + ')');

	let group = treeMap.selectAll('g')
								.data(tree.leaves())
								.enter()
								.append('g')
									.attr('class', 'group')
									.attr('transform', (d) => 'translate(' + d['x0'] + ', ' + d['y0'] + ')');

	group.append('rect')
	.attr('width', (d, i) => d['x1'] - d['x0'])
	.attr('height', (d, i) => d['y1'] - d['y0'])
	.attr('fill', d => colorScale(d['data']['category']))
	.attr('class', 'tile')
	.attr('data-name', (d, i) => d['data']['name'])
	.attr('data-category', (d, i) => d['data']['category'])
	.attr('data-value', (d, i) => d['data']['value'])
	// .append('title')
	// .text(d['data']['name'] + ' (' + d['data']['category'] + '): ' + d['data']['value'])
	.on('mouseover', (d) => tooltip.style('display', 'block').attr('data-value', d['value']).text(d['data']['name'] + ' (' + d['data']['category'] + '): ' + d['data']['value']))
	.on('mousemove', () => tooltip.style('top', (d3.event.pageY - 35) + 'px').style('left', (d3.event.pageX + 5) + 'px'))
	.on('mouseout', () => tooltip.style('display', 'none'));

	group.append('text')
	.attr('class', 'tile-text')
	.selectAll('tspan')
	.data(d => d['data']['name'].split(/\s/g))
	.enter()
	.append('tspan')
		.attr('x', 5)
		.attr('y', (d, i) => 10 + (i * 10))
		.text(d => d);
}
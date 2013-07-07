module.exports = {

	"Sense.c": [
		'void setup()',
		'{',
		'}',
		'',
		'void loop()',
		'{',
		'	sense();',
		'}',
		'',
		'void sense()',
		'{',
		'}'
	].join('\n'),

	"Think.c": [
		'void setup()',
		'{',
		'}',
		'',
		'void loop()',
		'{',
		'	think();',
		'}',
		'',
		'void think()',
		'{',
		'	block_value = weighted_average(neighbor_data);',
		'}'
	].join('\n'),

	"Act.c": [
		'void setup()',
		'{',
		'}',
		'',
		'void loop()',
		'{',
		'	think();',
		'	act();',
		'}',
		'',
		'void think()',
		'{',
		'	block_value = weighted_average(neighbor_data);',
		'}',
		'',
		'void act()',
		'{',
		'}'
	].join('\n')

}
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
	].join('\n'),

	"Ramp.c": [
		'void setup()',
		'{',
		'	block_value = 0;',
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
		'	wait(50);',
		'	block_value = (block_value == 255) ? 0 : block_value + 1;',
		'}',
		'',
		'void act()',
		'{',
		'	set_bar_graph(block_value);',
		'}'
	].join('\n'),

	"Pong.c": [
		'void setup()',
		'{',
		'}',
		'',
		'void loop()',
		'{',
		'	act();',
		'}',
		'',
		'void act()',
		'{',
		'	static int i = 0;',
		'	static int d = 1;',
		'	clear_bar(i);',
		'	if (i == 9) d = -1;',
		'	if (i == 0) d = 1;',
		'	i += d;',
		'	set_bar(i);',
		'	wait(500);',
		'}'
	].join('\n')

}
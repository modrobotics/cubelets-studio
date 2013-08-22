void setup()
{
	block_value = 0;
}

void loop()
{
	think();
	act();
}

void think()
{
	wait(50);
	block_value = (block_value == 255) ? 0 : block_value + 1;
}

void act()
{
	set_bar_graph(block_value);
}
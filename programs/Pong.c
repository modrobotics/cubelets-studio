void setup()
{
}

void loop()
{
	act();
}

void act()
{
	static int i = 0;
	static int d = 1;
	clear_bar(i);
	if (i == 9) d = -1;
	if (i == 0) d = 1;
	i += d;
	set_bar(i);
	wait(500);
}
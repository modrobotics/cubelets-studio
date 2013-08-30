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
	if (i == 50) d = -1;
	if (i == 0) d = 1;
	i += d;
	set_flashlight(i);
	wait(50);
}
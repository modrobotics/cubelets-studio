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
    set_flashlight(i++ % 2 == 0 ? 0 : 255);
	wait(50);
}
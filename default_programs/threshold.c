void setup()
{

}

void loop()
{
    think();
}
uint8_t threshold;
uint8_t average;
void think()
{
	threshold = get_knob();
	average = weighted_average(neighbor_data);
    if(average >= threshold)
    {
    	block_value = average;
    }
    else
    {
    	block_value = 0;
    }
}

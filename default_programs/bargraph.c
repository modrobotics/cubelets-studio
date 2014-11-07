void setup() 
{
    
}

void loop()
{  
    think();
    act();
}

void think()
{  
    block_value = weighted_average(neighbor_data);
} 

void act()
{ 
    set_bar_graph(block_value);
} 
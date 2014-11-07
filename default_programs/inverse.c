void setup()
{   
    
}    

void loop()  
{  
    think();  
}    

void think()  {  
    block_value = weighted_average(neighbor_data);  
    block_value = inverse(block_value);  
} 
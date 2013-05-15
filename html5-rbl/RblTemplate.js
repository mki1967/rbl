function RblTemplate()
{
}

RblTemplate.prototype.getData= function(data) // getting data fields from 'data' object
{
for(field in data) 
  if (this[field] && typeof(this[field]) != 'function' && typeof(data[field]) != 'function')  
     this[field]=data[field];
  else 
     alert(" "+field+" : "+data[field]);
}


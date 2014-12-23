/* Example of javascript functions


Observations: 
functions can access, "see" the values of their local variables,
and those of enclosing functions?

Exercise: Model this with the call stack diagrams in the lecture notes.
*/

var shipping = 50;   

function buyChocolate(x) { 
  var ChocolatePrice = 100; 
  
  function moneyLeft(x) {
      var tip = 10;           
      return x-  ChocolatePrice - tip - shipping;     //the calculation takes place
  }
          
  return moneyLeft(x);
}
   
console.log(buyChocolate(300));


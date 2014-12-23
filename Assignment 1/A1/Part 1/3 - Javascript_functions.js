/* Example of javascript functions

Functions can be declared from within other functions and returned as data objects (function pointers)

Question: what happens when a function creates another function the depends on a local variable of the creator?

ISSUE: function make() will no longer be represented on the stack from when action() is run. 

SIGNIFICANCE: "Everything you were probably taught in 1st year about how procedure calls work just went bye bye"

*/

var base = 100;   //line 1


function make(){
   var outside = 1000;
   return function(x){
      temp = outside;
      outside *= 2;
      return x + base + temp;}
}

var action = make();

console.log(action(10));
console.log(action(10));



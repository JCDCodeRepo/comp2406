
// R1.1) This recursive function lists all the prime numbers below and including 'num' 
function listAllPrimesUnder(num){
	counter = 0;
	if (num >= 3){
		for (i = 2;i<=Math.ceil(num/2);i++){ 				//checks all numbers >1 and <num/2 to see if they divide evenly into num
			if (num % i == 0){
				counter++;				//counts all the numbers that divide evenly into num
			}
		}
		if (counter == 0){				//num is only prime if no number divided evenly
			return (num+"\n"+listAllPrimesUnder(num-1));				//return num, and check if num-1 is a prime
		}
		else{
			return (listAllPrimesUnder(num-1));				// num isn't a prime - recursively check if num-1 is a prime
		}
	}
	return;
}

input = 5
console.log("Here are all the prime numbers <= "+input+":\n"+ listAllPrimesUnder(input));

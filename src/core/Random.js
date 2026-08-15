export class Random {
  static int(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
  static dice(){return Random.int(1,6);}
}
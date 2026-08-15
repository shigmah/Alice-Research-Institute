export class Cat {
  constructor({id=null,color="white",lifetime=3,createdAt=1}={}){
    this.id=id??(`cat-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    this.color=color; this.lifetime=lifetime; this.createdAt=createdAt;
  }
}
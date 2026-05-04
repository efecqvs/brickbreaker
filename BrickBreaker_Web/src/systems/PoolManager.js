export default class PoolManager {
    constructor(createFn, size) {
        this.createFn = createFn;
        this.pool = Array.from({length: size}, createFn);
    }

    get() {
        let obj = this.pool.find(o => !o.active);
        if(!obj) { 
            obj = this.createFn(); 
            this.pool.push(obj); 
        }
        obj.active = true; 
        return obj;
    }

    getActive() { 
        return this.pool.filter(o => o.active); 
    }

    reset() { 
        this.pool.forEach(o => o.active = false); 
    }
}
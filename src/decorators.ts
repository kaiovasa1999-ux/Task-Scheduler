namespace App{
    export function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor){
        const originalMetohd= descriptor.value; 
        const adjDescriptor: PropertyDescriptor ={
            configurable: true,
            get () {
                const boundFN = originalMetohd.bind(this);
                return boundFN;
            }
        }
        return adjDescriptor;
    }
}
'use strict';
const shim = require('fabric-shim');
const util = require('util');

let id=0;

let Chaincode = class {
 
    async Init(stub) {
    console.info('=========== Instantiated e-commerce chaincode ===========');
    return shim.success();
      }

  
  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
         } catch (err) {
      console.log(err);
      return shim.error(err);
         }
     }
  
async initLedger(stub,args) {
        console.info('============= START : Initialize Ledger ===========');
        const items = [
            {type:'gadgets',model:'G1',name:'Smartphone',price:'1000',sku_id:1},
            {type:'electronics',model:'E1',name:'AirCondition',price:'2000',sku_id:2},
            {type:'garments',model:'ga1',name:'T-shirt',price:'200',sku_id:3},
            {type:'gadgets',model:'G2',name:'Laptop',price:'5000',sku_id:4}
          ];

        for (let i = 0; i < items.length; i++) {
            
            items[i].docType = "products";
            await stub.putState('Item' + i, Buffer.from(JSON.stringify(items[i])));
        
        }
        console.log("Ledger init success!");
    }

    async queryAllProducts(stub,args) {
        const startKey = 'Item0';
        const endKey = 'Item99';

        const iterator = await stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return Buffer.from(JSON.stringify(allResults));
                 }
              }
         }
    async buyProduct(stub, args) {
     if (args.length != 3) {
      throw new Error('Incorrect number of arguments. Expecting 3');
           }
     console.info('Buying Product..');
      let orderId= ++id;
 
       const order = {
            ItemId:args[0],
            OrderId: 'Ord'+orderId,
            docType: 'orders',
            Customer:args[1],
            Quantity:args[2],
            Status:'Order Placed'
                 };
  
       await stub.putState('Ord'+ orderId, Buffer.from(JSON.stringify(order)));
       console.info('Order Placed Succesfully. Your Order Id is Ord'+orderId);
           }

    async allOrders(stub,args){
        console.log("All Orders called");
        const startKey = 'Ord0';
        const endKey = 'Ord99';

        const iterator = await stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return Buffer.from(JSON.stringify(allResults));
                     }
               }
           }

async addProduct(stub, args) {
      if (args.length != 6) {
      throw new Error('Incorrect number of arguments. Expecting 6');
        }
console.info('============= Adding Product.. ===========');

        const item = {
            type:args[1],
            model:args[2],
            name:args[3],
            price:args[4],
            docType:'products',
            sku_id:args[5]
          };

        await stub.putState(args[0], Buffer.from(JSON.stringify(item)));
        console.info('=============Product Added with an Id of'+args[0]);
    }
  
   async myOrder(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1');
    }
    

    let orderAsBytes = await stub.getState(args[0]); 
    if (!orderAsBytes || orderAsBytes.toString().length <= 0) {
      throw new Error(orderId + ' does not exist: ');
    }
    console.log(orderAsBytes.toString());
    return orderAsBytes;
  }
    async changeOrderStatus(stub, args) {
     if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2');
            }
        console.info('===Changing Order Status===');

        const orderAsBytes = await stub.getState(args[0]); // get the car from chaincode state
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error('Order does not exist With an Id of '+args[0]);
             }
        const order = JSON.parse(orderAsBytes.toString());
        order.Status= args[1];

        await stub.putState(args[0], Buffer.from(JSON.stringify(order)));
        console.info('============= END : changed order Status ===========');
          }
    

}

shim.start(new Chaincode());

'use strict'

let id=0;

const { Contract } = require('fabric-contract-api');

class ECOM extends Contract {

async Init(ctx) {
    console.info('=========== Instantiated e-commerce chaincode ===========');
    return shim.success();
      }

  
  async Invoke(ctx) {
    let ret = ctx.stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    let args = ret.params;
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(ctx,args);
      return shim.success(payload);
         } catch (err) {
      console.log(err);
      return shim.error(err);
         }
     }

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const items = [
            {
                type:'gadgets',
                model:'G1',
                name:'Smartphone',
                price:'1000',
                sku_id:1
            },
            {
              type:'electronics',
              model:'E1',
              name:'AirCondition',
              price:'2000',
              sku_id:2
 
            },
            {
                type:'garments',
                model:'ga1',
                name:'T-shirt',
                price:'200',
                sku_id:3
            },
            {
                type:'gadgets',
                model:'G2',
                name:'Laptop',
                price:'5000',
                sku_id:4
            }
        ];

        for (let i = 0; i < items.length; i++) {
            
            items[i].docType = "products";
            await ctx.stub.putState('Item' + i, Buffer.from(JSON.stringify(items[i])));
        
        }
        console.log("Ledger init success!");
    }

    async queryAllProducts(ctx) {
        const startKey = 'Item0';
        const endKey = 'Item99';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

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
                return JSON.stringify(allResults);
            }
        }
    }

    async buyProduct(ctx,args) {
        console.info('Buying Product..');

        const order = {
            ItemId:args[0],
            docType: 'orders',
            Customer:args[1],
            Quantity:args[2],
            Status:args[3]
        };
      let orderId= ++id;
        await ctx.stub.putState('Ord'+orderId, Buffer.from(JSON.stringify(order)));
        console.info('Order Placed Succesfully.'+orderId);
    }
  async myOrder(ctx, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1');
    }
    

    let orderAsBytes = await ctx.stub.getState(args[0]); 
    if (!orderAsBytes || orderAsBytes.toString().length <= 0) {
      throw new Error( 'Order does not exist: ');
    }
    console.log(orderAsBytes.toString());
    return orderAsBytes;
  }

    async allOrders(ctx){
        console.log("All Orders called");
        const startKey = 'Ord0';
        const endKey = 'Ord99';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

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
                return JSON.stringify(allResults);
            }
        }
    }

async addProduct(ctx,args) {
        console.info('============= Adding Product.. ===========');

        const item = {
            type:args[1],
            model:args[2],
            name:args[3],
            price:args[4],
            docType:'products',
            sku_id: args[5]
        };

        await ctx.stub.putState(args[0], Buffer.from(JSON.stringify(item)));
        console.info('=============Product Added with an Id of '+args[0]);
    }
  

    async changeOrderStatus(ctx, args) {
        console.info('===Changing Order Status===');

        const orderAsBytes = await ctx.stub.getState(args[0]); // get the car from chaincode state
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`order with this Id does not exist`);
        }
        const order = JSON.parse(orderAsBytes.toString());
        order.Status= args[1];

        await ctx.stub.putState(args[0], Buffer.from(JSON.stringify(order)));
        console.info('============= END : changed order Status ===========');
    }
    

}


module.exports = ECOM;

'use strict'

let id=0;

const { Contract } = require('fabric-contract-api');

class ECOM extends Contract {

async Init(ctx) {
    console.info('=========== Instantiated e-commerce chaincode ===========');
    return shim.success();
      }

  
  async Invoke(ctx) {
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

    async buyProduct(ctx, itemId, customerName, quantity, status) {
        console.info('Buying Product..');

        const order = {
            ItemId:itemId,
            docType: 'orders',
            Customer:customerName,
            Quantity:quantity,
            Status:status
        };
  orderId= ++ id;
        await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(order)));
        console.info('Order Placed Succesfully. Your Order Id is..'+orderId);
    }

    async allOrders(ctx){
        console.log("All Orders called");
        const startKey = 0;
        const endKey = 100;

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

async addProduct(ctx, itemId, Type, Model, Name, Price, Sku_id) {
        console.info('============= Adding Product.. ===========');

        const item = {
            type:Type,
            model:Model,
            name:Name,
            price:Price,
            docType:'products',
            sku_id: Sku_id
        };

        await ctx.stub.putState(itemId, Buffer.from(JSON.stringify(item)));
        console.info('=============Product Added with an Id of..'+itemId);
    }
  

    async changeOrderStatus(ctx, orderId, orderStatus) {
        console.info('===Changing Order Status===');

        const orderAsBytes = await ctx.stub.getState(orderId); // get the car from chaincode state
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`${orderId} does not exist`);
        }
        const order = JSON.parse(orderAsBytes.toString());
        order.Status= orderStatus;

        await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(order)));
        console.info('============= END : changed order Status ===========');
    }
    

}


module.exports = ECOM;

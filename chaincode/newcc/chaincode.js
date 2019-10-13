'use strict'

let id=0;

const { Contract } = require('fabric-contract-api');

class ECOM extends Contract {

async Init(ctx,s1,s2) {
     let marks={
       Subj1:s1,
       Subj2:s2
      }
     await ctx.stub.putState('a',Buffer.from(JSON.stringify(marks)));
    console.info('=========== Instantiated test chaincode ===========');
   
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

    async buyProduct(ctx,itemId,customer,quantity) {
        console.info('Buying Product..');
       
const order = {
            ItemId:itemId,
            docType: 'orders',
            Customer:customer,
            Quantity: quantity,
            Status:'Placed'
        };
      let orderId= ++id;
        await ctx.stub.putState('Ord'+orderId, Buffer.from(JSON.stringify(order)));
        console.info('Order Placed Succesfully.'+orderId);
    }
  async myOrder(ctx, orderId) {
 
   let orderAsBytes = await ctx.stub.getState(orderId); 
    if (!orderAsBytes || orderAsBytes.toString().length <= 0) {
      throw new Error( 'Order does not exist: ');
    }
    console.info(orderAsBytes.toString());
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

async addProduct(ctx,ItemId,Type,Model,Name,Price,Sku_Id) {
        console.info('============= Adding Product.. ===========');

        const item = {
            type:Type,
            model:Model,
            name:Name,
            price:Price,
            docType:'products',
            sku_id:Sku_Id
        };

        await ctx.stub.putState(ItemId, Buffer.from(JSON.stringify(item)));
        console.info('=============Product Added with an Id of '+ItemId);
    }
  

    async changeOrderStatus(ctx, orderId,orderStatus) {
        console.info('===Changing Order Status===');

        const orderAsBytes = await ctx.stub.getState(orderId); // get the car from chaincode state
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`order with this Id does not exist`);
        }
        const order = JSON.parse(orderAsBytes.toString());
        order.Status= orderStatus;

        await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(order)));
        console.info('============= END : changed order Status ===========');
    }
    

}


module.exports = ECOM;

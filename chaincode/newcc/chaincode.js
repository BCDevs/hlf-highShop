'use strict';
//for patent listings
let id=0;
const { Contract } = require('fabric-contract-api');
class Patents extends Contract {

    
 async registerOwner(ctx, ownerId,key,ownerName) {

        let ownerData = {
            id: ownerId,
            name: ownerName,
            type: 'owner',
            ownedPatents: [],
            proposedPatents: [],
            accessKey:key
             };
   let ownerAsBytes = await ctx.stub.getState(ownerId); 
   if (!ownerAsBytes || ownerAsBytes.toString().length <= 0) {
 
     await ctx.stub.putState(ownerId, Buffer.from(JSON.stringify(ownerData)));

             }
    else {
      throw new Error('Username is already taken.!');
         }
  }
  async registerPublisher(ctx, publisherId,key, publisherName) {

        let publisherData = {
            id: publisherId,
            name: publisherName,
            type: 'publisher',
            publishedPatents: [],
            accessKey:key
        };
        let publisherAsBytes = await ctx.stub.getState(publisherId); 
       if (!publisherAsBytes || publisherAsBytes.toString().length <= 0) {
 
          await ctx.stub.putState(publisherId, Buffer.from(JSON.stringify(publisherData)));

             }

       else {
          throw new Error('Username is already taken.!');
         }
  }
 async registerVerifier(ctx, verifierId, key,verifierName) {

        let verifierData = {
            id: verifierId,
            name: verifierName,
            type: 'verifier',
            verifiedPatents: [],
            accessKey:key
        };
      let verifyerAsBytes = await ctx.stub.getState(verifierId); 
       if (!verifyerAsBytes || verifyerAsBytes.toString().length <= 0) {
 
  
      await ctx.stub.putState(verifierId, Buffer.from(JSON.stringify(verifierData)));

         }

        else {
          throw new Error('Username is already taken.!');
          }
  }

 async registerAuditor(ctx, auditorId,key, auditorName) { 

        let auditorData = {
            id: auditorId,
            name: auditorName,
            type: 'auditor',
            auditedPatents: [],
            accessKey:key
        };

      let auditorAsBytes = await ctx.stub.getState(auditorId); 
       if (!auditorAsBytes || auditorAsBytes.toString().length <= 0) {
 
        await ctx.stub.putState(auditorId, Buffer.from(JSON.stringify(auditorData)));

          } else {
            throw new Error('Username is already taken.!');
        }
}
async registerPatent(ctx,ownerId,key,patentName,industry){
         
let credentialsAsBytes = await ctx.stub.getState(ownerId); 
    
  if (!credentialsAsBytes || credentialsAsBytes.toString().length <= 0) {
    throw new Error('Incorrect OwnerId..!');
         }
  else{
  let credentials= JSON.parse(credentialsAsBytes);
  if (key!=credentials.accessKey) {
  throw new Error('Incorrect Access key..!');
        }
   let refId=++id;
   let patentData = {
                "type":"patent",
                "name":patentName,
                "id":'Pat'+refId,
                "ownerId":ownerId,
                "verifierId":"Not Yet Verified",
                 "publisherId":"Not Yet Published",
                  "auditorId":"Not Yet Audited",
                "status":"Proposed",
                 "validity":"None",
                "industry":industry,
                "details":"To be Finalized"
                  };
          
            //store patent identified by patentID
    //Adding patent to Proposed patent list..
    credentials.proposedPatents.push('Pat'+refId);
    await ctx.stub.putState(ownerId, Buffer.from(JSON.stringify(credentials)));
    await ctx.stub.putState('Pat'+refId, Buffer.from(JSON.stringify(patentData)));
    
            console.log('Patent Successfully Proposed With an Id of Pat'+refId);
        }
}

async verifyPatent(ctx,verifierId,key, patentId) {

   let credentialsAsBytes = await ctx.stub.getState(verifierId); 
    
  if (!credentialsAsBytes || credentialsAsBytes.toString().length <= 0) {
    throw new Error('Incorrect verifierId..!');
         }
  else{
  let credentials= JSON.parse(credentialsAsBytes);
  if (key!=credentials.accessKey) {
  throw new Error('Incorrect Access key..!');
        }    

 let patentAsBytes = await ctx.stub.getState(patentId);
 if (!patentAsBytes || patentAsBytes.toString().length <= 0) {
    throw new Error('Patent With This Id Doesnt Exist..!');
         }
  let patent = JSON.parse(patentAsBytes);
  patent.verifierId = verifierId;
  patent.status = "Passed Verification Phase";
  patent.auditorId = "To be Audited";
     
   //Adding Verified Patents to Verifier Profile
   credentials.verifiedPatents.push(patentId);
   await ctx.stub.putState(verifierId, Buffer.from(JSON.stringify(credentials)));
         

   await ctx.stub.putState(patentId, Buffer.from(JSON.stringify(patent)));
   console.log("Patent Details Verified and Submitted to Auditor Successfully..")

    }
 }

 async approvePatent(ctx, auditorId, key, patentId, validity) {

   let credentialsAsBytes = await ctx.stub.getState(auditorId); 
    
  if (!credentialsAsBytes || credentialsAsBytes.toString().length <= 0) {
    throw new Error('Incorrect auditorId..!');
         }
  else{
  let credentials= JSON.parse(credentialsAsBytes);
  if (key!=credentials.accessKey) {
  throw new Error('Incorrect Access key..!');
        }    

 let patentAsBytes = await ctx.stub.getState(patentId);
 if (!patentAsBytes || patentAsBytes.toString().length <= 0) {
    throw new Error('Patent With This Id Doesnt Exist..!');
         }
  let patent = JSON.parse(patentAsBytes);
  if (patent.status!= "Passed Verification Phase"){
     throw new Error("Patent is not Verified yet or Rejected");
      }
 

   patent.status="Approved and Ready To be Published"
   patent.auditorId=auditorId;
   patent.validty=validity;
   await ctx.stub.putState(patentId, Buffer.from(JSON.stringify(patent)));
  
   //Adding Patents to Auditor Profile
   credentials.auditedPatents.push(patentId);
   await ctx.stub.putState(auditorId, Buffer.from(JSON.stringify(credentials)));
   console.log("Patent is Approved and Ready To Publish..")
   
   }
    
}
async rejectPatent(ctx,auditorId,key,patentId) {

  let credentialsAsBytes = await ctx.stub.getState(auditorId); 
    
  if (!credentialsAsBytes || credentialsAsBytes.toString().length <= 0) {
    throw new Error('Incorrect auditorId..!');
         }
  else{
  let credentials= JSON.parse(credentialsAsBytes);
  if (key!=credentials.accessKey) {
  throw new Error('Incorrect Access key..!');
        }    

 let patentAsBytes = await ctx.stub.getState(patentId);
 if (!patentAsBytes || patentAsBytes.toString().length <= 0) {
    throw new Error('Patent With This Id Doesnt Exist..!');
     }
  let patent = JSON.parse(patentAsBytes);
  if (patent.status="Passed Verification Phase"){
      
   patent.status="Rejected";
   await ctx.stub.putState(patentId, Buffer.from(JSON.stringify(patent)));
   console.log("Patent Rejected..")
         }        
throw new Error("Patent is Not Yet Verified or Already Rejected..!")
   }
}
 async publishPatent(ctx,publisherId,key, patentId,details) {

       let credentialsAsBytes = await ctx.stub.getState(publisherId); 
    
  if (!credentialsAsBytes || credentialsAsBytes.toString().length <= 0) {
    throw new Error('Incorrect publisherId..!');
         }
  else{
  let credentials= JSON.parse(credentialsAsBytes);
  if (key!=credentials.accessKey) {
  throw new Error('Incorrect Access key..!');
        }    

 let patentAsBytes = await ctx.stub.getState(patentId);
 if (!patentAsBytes || patentAsBytes.toString().length <= 0) {
    throw new Error('Patent With This Id Doesnt Exist..!');
         }
  let patent = JSON.parse(patentAsBytes);
  if (patent.status!="Approved and Ready To be Published"){
     throw new Error("Patent is not Approved yet or Rejected");
      } 

   patent.status="Approved And Published"
   patent.details=details; 
   await ctx.stub.putState(patentId, Buffer.from(JSON.stringify(patent)));
  // Adding Patent Details to Publisher Profile..
  credentials.publishedPatents.push(patentId);
  await ctx.stub.putState(publisherId, Buffer.from(JSON.stringify(credentials)));
  // Linking Patent With Owner
 let owner= patent.ownerId;
 let ownerAsBytes=await ctx.stub.getState(owner);
 let ownerData=JSON.parse(ownerAsBytes)
 ownerData.ownedPatents.push(patentId);
 
 await ctx.stub.putState(owner, Buffer.from(JSON.stringify(ownerData)));
  
  console.log("Patent is Aproved and Published..")
   
  }
     
}   
    // get the state from key
    async GetState(ctx, key) {
        let data = await ctx.stub.getState(key);
        let jsonData = JSON.parse(data.toString());
        return JSON.stringify(jsonData);
    }
        
}

module.exports = Patents;

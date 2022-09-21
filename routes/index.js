const express = require('express');
const router = express.Router();
const axios = require('axios');
const CryptoJS = require('crypto-js');
const PORT = process.env.PORT;
const hubspotHeader = {
    headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS}`,
        'Content-Type': 'application/json'
    }
}
router.get('/login', (req, res) => {
res.render('login')
})
router.get('/register', (req, res) => {
   res.render('register')
})
router.post('/register', async(req, res) => {
const user_data=req.body
const encrypt = (text) => {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
};
let password=encrypt(user_data.password)
let check_email_present=[],create_user=[]
if(user_data.email != ""){
  try{
    let data={
        "filterGroups":[
          {
            "filters":[
              {
                "propertyName": "email",
                "operator": "EQ",
                "value":user_data.email
              }
            ]
          }
        ],
        "properties":[
          "u_pass"
        ]
      }
    check_email_present=await axios.post(`https://api.hubapi.com/crm/v3/objects/contacts/search`,data,hubspotHeader)
}    
catch(error){
    console.log(error)
}  

if(check_email_present && check_email_present.data){
if(check_email_present.data.total==0){
  try{
    let data={
        "properties":{
            "firstname":user_data.firstname,
            "lastname":user_data.lastname,
            "email":user_data.email,
            "u_pass":password,
            "uid":user_data.uid
        }
     }
  
    create_user=await axios.post('https://api.hubapi.com/crm/v3/objects/contacts',data,hubspotHeader)
    res.send({"error":false})
}
catch(error){
    console.log(error)
}
}
else{
 
  if(check_email_present.data.results[0].properties.u_pass==null || check_email_present.data.results[0].properties.u_pass==""){
    console.log("update")
    try{
      let data={
          "id":check_email_present.data.results[0].id,
          "properties":{
              "firstname":user_data.firstname,
              "lastname":user_data.lastname,
              "email":user_data.email,
              "u_pass":password,
              "uid":user_data.uid
          }
       }
      
      create_user=await axios.patch(`https://api.hubapi.com/crm/v3/objects/contacts/${check_email_present.data.results[0].id}`,data,hubspotHeader)
      res.send({"error":false})
  }
  catch(error){
      console.log(error)
  }
  }
  else{
    console.log("already exists")
    res.send({"error":true})
  }
}
}
}


})
router.post('/login',async(req,res)=>{
  var login_data=req.body;
  let check_email_present=[];
  
  const decrypt = (data) => {
    return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
  };
// let password=encrypt(login_data.password)
try{
  let data={
      "filterGroups":[
        {
          "filters":[
            {
              "propertyName": "email",
              "operator": "EQ",
              "value":login_data.email
            }
      ]
        }
      ],
      "properties":[
        "u_pass",
        "uid"
      ]
    }
  check_email_present=await axios.post(`https://api.hubapi.com/crm/v3/objects/contacts/search`,data,hubspotHeader)
}    
catch(error){
  console.log(error)
}
if(check_email_present && check_email_present.data){
  if(check_email_present.data.total==0){
    res.send({"error":true})
  }
  else{
    let password=decrypt(check_email_present.data.results[0].properties.u_pass)
    if(password == login_data.password){
      res.send({"error":false,"uid":check_email_present.data.results[0].properties.uid})
    }
    else{
      res.send({"error":true})
    }
  }
} 
// res.send({"success":"true"})
})
module.exports = router;
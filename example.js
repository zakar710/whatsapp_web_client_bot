const fs = require('fs');

const axios = require('axios');
var menuItemSelected = 0;
var locationInformationOn = 0;
var Usernavigation = '';
var locationmenu = '';
var content = null;



    
 //api to fetch all the query categories/topics for the menu




const { Client, Location } = require('./index');

const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({ puppeteer: { headless: false }, session: sessionCfg });
// You can use an existing session and avoid scanning a QR code by adding a "session" object to the client options.
// This object must include WABrowserId, WASecretBundle, WAToken1 and WAToken2.

client.initialize();

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});

client.on('message', async msg => {
            console.log('MESSAGE RECEIVED', msg);
         // if the user has not selected anything but has greeted the chatbot or returned to the home menu with index 0
    if ( msg.body.startsWith('!Hi') 
         || msg.body.startsWith('!Hello') 
         || msg.body.startsWith('!Hey')
         || msg.body.startsWith('!Habari')
         || msg.body.startsWith('0') ){

                                var menu =  '';             
                                menu+='\n' +'1'+'\t'+'FAQs' + '\n'
                                        +'2'+'\t'+'Locations around the University' + '\n'
                                        +'3'+'\t'+'Subscribe for updates' + '\n'
                                        +'4'+'\t'+'Contact support' + '\n'
                                        +'5'+'\t'+'Suggest/complain about something' + '\n'; 
                                console.log(menu)   

                                // const chat = await msg.getChat();
                                // chat.sendStateTyping();
                                // chat.clearState();

                                msg.reply("Welcome to UDSM support chatbot, select the service from the menu below"+menu);

                                if(msg.body.startsWith('0')){
                                content = null;

                                }

                                console.log(content);

                }
                else{

                    if(msg.body){

                                    let number = msg.body;
                                    let id = parseInt(number);
                                    let userNumber = msg.from;
                                    let UserNumber = parseInt(userNumber);
                                    var today = new Date();
                                    var currentTime = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();


                                    // console.log(id);
                                    // console.log('Sent from'+userNumber);

                                    // console.log(number);
                                    
                                    // console.log('Sent from'+UserNumber);

                            if(id == 1){

                                //Faq menu
                                axios.get('http://127.0.0.1:8000/information_feedbacks/')
                                              .then((response) => {
                                                var mesg =  '';
                                        
                                                 for(let menu of response.data){
                                                                 
                                                    mesg+='\n' + menu.id+'\t'+menu.query_category + '\n'; 
                                                          
                                                  } 
                                                  +''; 
                                                  msg.reply("Welcome to UDSM FAQs Menu, select the topic from the menu below by its number"+mesg);
                                              })

                                // record the visit
                                async function recordVisit() {

                                    params = {
                                        phone_number: UserNumber,
                                        query_category: 'Faq',
                                        status_for_visit: '1',
                                        dateLastAccessed: currentTime,
                                      }
                                
                                    let res = await axios.post('http://127.0.0.1:8000/visits/', params);
                                
                                    console.log(res.data);
                                }
                              recordVisit();

                            }

                            if(id == 2){

                                //locations menu
                                 axios.get('http://127.0.0.1:8000/navigation/')
                                 .then((response) => {
                                   var mesg =  '';
                           
                                    for(let menu of response.data){
                                                    
                                       mesg+='\n' + menu.id+'\t'+menu.location + '\n'; 
                                             
                                     } 
                                     +''; 
                                     msg.reply("Welcome to UDSM Frequently asked locations Menu, select the topic from the menu below by its number"+mesg);
                                 })
                                 
                                    // record the visit
                                    async function recordVisit() {

                                        params = {
                                            phone_number: UserNumber,
                                            query_category: 'Locations',
                                            status_for_visit: '1',
                                            dateLastAccessed: currentTime,
                                            }
                                    
                                        let res = await axios.post('http://127.0.0.1:8000/visits/', params);
                                    
                                        console.log(res.data);
                                    }
                                    recordVisit();

                            }

                            if(id >10 && id <20){
                                        
                                    //locations content

                                    // get location id from header
                                    let FAQId = id;

                                    axios.get('http://127.0.0.1:8000/information_feedbacks/'+FAQId)
                                    .then((response) => {
                                        

                                        let FAQ = response.data
                                                        
                                        feedback = FAQ.feedback
                                        

                                        
                                        console.log(feedback) 

                                        msg.reply(+''+feedback+'');


                                })

                                                    
                                        // record the visit
                                        async function recordVisit() {
                    
                                            params = {
                                                phone_number: UserNumber,
                                                query_category: 'FAQS',
                                                status_for_visit: '1',
                                                dateLastAccessed: currentTime,
                                            }
                                        
                                            let res = await axios.post('http://127.0.0.1:8000/visits/', params);

                                            console.log(res.data);
                                        }
                                    recordVisit();
         


                            }

                            if(id >20 && id <30)
                            {
                                
                                     //locations content

                                    // get location id from header
                                    let placeId = id;

                                    axios.get('http://127.0.0.1:8000/navigation/'+placeId)
                                    .then((response) => {
                                        

                                        let navigation = response.data
                                                        
                                        location = navigation.location
                                        latitude = navigation.latitude
                                        longitude = navigation.longitude

                                        
                                        console.log(location) 
                                        console.log(latitude) 
                                        console.log(longitude) 

                                        msg.reply(new Location(longitude, latitude, location));


                                                         })

                                                    
                                        // record the visit
                                        async function recordVisit() {
                    
                                            params = {
                                                phone_number: UserNumber,
                                                query_category: 'Location',
                                                status_for_visit: '1',
                                                dateLastAccessed: currentTime,
                                            }
                                        
                                            let res = await axios.post('http://127.0.0.1:8000/visits/', params);

                                            console.log(res.data);
                                        }
                                    recordVisit();
                               
                                
                            }

                
                        }

                }
                

         // if the user selects 1 on the menu which stands for FAQs
        //  if (msg.body.startsWith('1') && content == null) {

          
        //         axios.get('http://127.0.0.1:8000/query_categories/')
        //               .then((response) => {
        //                 var mesg =  '';
                
        //                  for(let menu of response.data){
                                         
        //                     mesg+='\n' + menu.id+'\t'+menu.name + '\n'; 
                                  
        //                   } 
        //                   +''; 
        //                   msg.reply("Welcome to UDSM FAQs Menu, select the topic from the menu below by its number"+mesg);
        //               })
                 

                   
                   
        //             console.log(content);

        //             content = 1;
        //             console.log(content);


        // }
        
// if the user selects 2 on the menu which stands for Locations
                //  if (msg.body.startsWith('2') && content == null) {
                //     async function displayLocations() {

                //             var place =  "";
  
                //             axios.get('http://127.0.0.1:8000/navigation/')
                //                   .then((response) => {
                                    
                            
                //                      for(let navigation of response.data){
                                                     
                //                       place+='\n' + navigation.id+'\t'+navigation.location + '\n'; 
                                              
                //                       } 
                //                       +''; 
                                      
                //                       console.log(place)
                //                       msg.reply("Welcome to UDSM Locations Menu, select the place from the menu below by its number"+place);
                //                   })
                //                 }
                               
                               

                //         displayLocations();
                //         console.log(content);

                //         content = 2;
                //         console.log(content);

                // }
  
// if the user one of the FAQs
// if (msg.body !='0' 
// || msg.body !='1' 
// || msg.body !='2' 
// || msg.body !='3' 
// || msg.body !='4' 
// || msg.body !='5') {
    

//             // var place =  "";
       
//         // get faq id from header
//         let FAQId = parseInt(msg.body);
//         if(FAQId >)
//         let FAQInformation = await axios.get('http://127.0.0.1:8000/query_categories/'+FAQId);
          
//         // get location id from header
//         console.log(FAQInformation);

//         console.log(FAQId);

//         msg.reply("Welcome to UDSM Information portal, select the place from the menu below by its number"+FAQInformation);
              
         
               

//         content = null;

//         console.log(content);

// } 
// if the user one of the locations
// if (msg.body > 0 && content == 2) {
    

//     // var place =  "";

 
//         // get location id from header
//         let placeId = msg.body;
//         let placeInformation = await axios.get('http://127.0.0.1:8000/navigation/'+placeId);
          
//         // get location id from header
//         console.log(placeInformation);
//               msg.reply("Welcome to UDSM Locations Menu, select the place from the menu below by its number"+placeInformation);
       
 
       

// content = null;
// console.log(content);


// }               

// if the user requests for something from the locations menu
                //  if (msg.body.startsWith('2')) {
                //     async function displayLocations() {

                //             var place =  "";
  
                //             axios.get('http://127.0.0.1:8000/navigation/')
                //                   .then((response) => {
                                    
                            
                //                      for(let navigation of response.data){
                                                     
                //                       place+='\n' + navigation.id+'\t'+navigation.location + '\n'; 
                                              
                //                       } 
                //                       +''; 
                                      
                //                       console.log(place)
                //                       msg.reply("Welcome to UDSM Locations Menu, select the place from the menu below by its number"+place);
                //                   })
                //                 }
                               
                               
                //     menuItemSelected = 2; 
                //     locationInformationOn = 1;
                //     displayLocations();
        
        
                // }

                //  // if the user selected 2 on the menu which stands for Locations and has selected a place to get directions
                //  if (menuItemSelected == 2 && msg.body != '0' && msg.body != '' ) {
                //     async function getLocation() {

                //                     // get location id from header
                //                     let placeId = msg.body;
                //                     let placeInformation = await axios.get('http://127.0.0.1:8000/navigation/'+placeId);
                                    
                //                     // get location id from header
                //                     console.log(placeInformation);
                //                     msg.reply(new Location(place.placeInformation, placeInformation.latitude, placeInformation.location));
                //                 }
                                
                               
                               
                //     menuItemSelected = 2;
                //     locationInformationOn = 1; 
                //     getLocation();
        
        
                // }
            
            
            //  else if (msg.body === '!ping') {
            //     // Send a new message to the same chat
            //     client.sendMessage(msg.from, 'pong');

            // }


            // else if (msg.body.startsWith('!echo ')) {
            //     // Replies with the same message
            //     msg.reply(msg.body.slice(6));
            // } 
            // else if (msg.body === '!location') {
            //     msg.reply(new Location(37.422, -122.084, 'Googleplex\nGoogle Headquarters'));
            // }
            // else if (msg.location) {
            //     msg.reply(msg.location);
            // } 
            // else if (msg.body === '!mention') {
            //     const contact = await msg.getContact();
            //     const chat = await msg.getChat();
            //     chat.sendMessage(`Hi @${contact.number}!`, {
            //         mentions: [contact]
            //     });
            // } 
        
            // else if (msg.body === '!typing') {
            //     const chat = await msg.getChat();
            //     // simulates typing in the chat
            //     chat.sendStateTyping();
            // } 

            // else if (msg.body === '!clearstate') {
            //     const chat = await msg.getChat();
            //     // stops typing or recording in the chat
            //     chat.clearState();
            // }

});

client.on('message_create', (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        // do stuff here
    }
});


client.on('message_ack', (msg, ack) => {
    /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

    if(ack == 3) {
        // The message was read
    }
});
    // device status
    client.on('change_battery', (batteryInfo) => {
        // Battery percentage for attached device has changed
        const { battery, plugged } = batteryInfo;
        console.log(`Battery: ${battery}% - Charging? ${plugged}`);
    });

    client.on('change_state', state => {
        console.log('CHANGE STATE', state );
    });

    client.on('disconnected', (reason) => {
        console.log('Client was logged out', reason);
    });

    // server.listen(PORT, () => console.log(`Server listening on port ${PORT}!!!`));

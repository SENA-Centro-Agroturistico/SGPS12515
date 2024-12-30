var rateLimit = require("express-rate-limit");
module.exports = {
    uiPort: process.env.PORT || 1700,
    // Otros ajustes de Node-RED
    adminAuth: require("./user-authentication"),
    // adminAuth: {
    //     type: "credentials",
    //     users: [{
    //         username: "admin",
    //         password: "$2a$08$i5bJ6U1q695a3pAIJd4eXO4dCppJT5Nam.8I.CA6DPstD41HJW11G",
    //         permissions: "*"
    //     }],
    //     sessionExpiryTime: 86400
    // },
    // Otros ajustes de Node-RED
    editorTheme: {
        page: {
            title: "SENA IOT",
            favicon: "/data/images/logo.ico", 
        },
        login: {
            image: "/data/images/logo.png" 
        },
        header: {
            title: "SENA IOT",
            image: "/data/images/logo-blanco.png", // or null to remove image
        },
    
    },   
    // disableEditor: true
    httpNodeMiddleware: rateLimit({
        windowMs: 1000, // 1000 milliseconds is set as the window time.
        max: 10 // limit access rate to 10 requests/second
    })
};
CommonBoard = {
    rollcallURL: '/rollcall',
    xmppDomain: 'glint',
    
    init: function() {
        Sail.app.rollcall = new Rollcall.Client(Sail.app.rollcallURL)
        
        Sail.app.run = JSON.parse($.cookie('run'))
        if (Sail.app.run) {
            Sail.app.groupchatRoom = Sail.app.run.name+'@conference.'+Sail.app.xmppDomain
        }
        
        Sail.modules
            .load('Rollcall.Authenticator', {mode: 'picker', askForRun: true, curnit: 'WallCology'})
            .load('Strophe.AutoConnector')
            .load('AuthStatusWidget')
            .thenRun(function () {
                Sail.autobindEvents(CommonBoard)
                
                $(document).ready(function() {
                    $('#reload').click(function() {
                        Sail.Strophe.disconnect()
                        location.reload()
                    })

                    $('#connecting').show()
                })

                $(Sail.app).trigger('initialized')
                return true
            })
    },
    
    authenticate: function() {
        Sail.app.token = Sail.app.rollcall.getCurrentToken()

        if (!Sail.app.token) {
            Rollcall.Authenticator.requestLogin()
        } else {
            Sail.app.rollcall.fetchSessionForToken(Sail.app.token, 
                function(data) {
                    Sail.app.session = data.session
                    $(Sail.app).trigger('authenticated')
                },
                function(error) {
                    console.warn("Token '"+Sail.app.token+"' is invalid. Will try to re-authenticate...")
                    Sail.app.token = null
                    Rollcall.Authenticator.requestLogin()
                }
            )
        }
    },
    
    events: {
        sail: {
            
        },
        
        initialized: function(ev) {
            Sail.app.authenticate()
        },
        
        connected: function(ev) {
        },
        
        authenticated: function(ev) {
            $('#connecting').hide()
        },
        
        unauthenticated: function(ev) {
            Rollcall.Authenticator.requestRun()
        }
    }
}
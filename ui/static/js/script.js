let token = null;
let deviceList = null;
let csvFile = null;
$(document).ready(function() {
    $("#callGo").on('click', function() {
        $("#tenantList").removeClass("hidden");
        loginInfo = {
            "login": "rkamalakaran.ext@objenious.com",
            "password": "Michael1508"
        }
        $.ajax({
            url: "https://api-preprod.objenious.com/v2/login",
            contentType: 'application/json',
            method: "POST",
            data: JSON.stringify(loginInfo),
            success: function(data) {
                token = data.token;
                $.ajax({
                    url: "http://api-preprod.objenious.com/v2/user/profile",
                    method: "GET",
                    headers: {
                        "x-token": data.token
                    },
                    success: function(tenantList) {
                        tenantList.contexts.forEach(element => {
                            $("#tenantList")
                                .append($("<option></option>")
                                .attr("value",element.id)
                                .text(element.organization_label));
                        });
                    },
                })
            },
        });
    });
});
function tenantListSelect (index, choosenTenant) {
    var paragraph = document.getElementById("choosenTenant");
    var text = document.createTextNode(choosenTenant);
    paragraph.appendChild(text);

    $.ajax({
        url: "https://api-preprod.objenious.com/v2/user/profile/chooseContext/" + index,
        method: "POST",
        headers: {
            "x-token": token
        },
        success: function(tenant) {
            $.ajax({
                url: "https://api-preprod.objenious.com/v2/devices",
                method: "GET",
                headers: {
                    "x-token": token
                },
                success: function (tenantDevices) {
                    deviceList = tenantDevices;
                    var table = $('#tenantDevice');
                    table.find("thead tr")[0].style.visibility = "visible";
                    table.find("tbody tr").remove();
                    var header = table.find("thead tr#tableHeader")
                    header.append("<th>ID</th><th>Name</th><th>Description</th>")
                    var propertiesKeys = [];
                    tenantDevices.forEach(function (elt1) {
                        Object.keys(elt1.properties).forEach(function (head) {
                            propertiesKeys.push(head);
                        })
                    });
                    var unique = propertiesKeys.filter(function(elem, index, self) {
                        return index === self.indexOf(elem);
                    })
                    unique.forEach(function(tablehead) {
                        header.append("<th>" + tablehead + "</th>")
                    })
                    tenantDevices.forEach(function (elt2) {
                        table.append("<tr id='" + elt2.id + "'><td>" + elt2.id + "</td><td>" + elt2.name + "</td><td>" + elt2.description + "</td></tr>");
                        unique.forEach(function (key) {
                            var row = document.getElementById(elt2.id);
                            var x = row.insertCell(-1);
                            x.innerHTML= "<td>" + elt2.properties[key] + "</td>";
                        })
                    })
                }
            })
        },
    })
}
function handleFileSelect(evt) {
    var file = evt.target.files[0];
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            data = results;
            csvFile = data.data;
            createSendingElement();
            var table = $('#CSVfileContent');
            table.find("thead tr")[0].style.visibility = "visible";
            table.find("tbody tr").remove();
            var header = table.find("thead tr#tableCSVHeader")
            
            var propertiesKeys = [];
            csvFile.forEach(function (elt3) {
                Object.keys(elt3).forEach(function (head) {
                    propertiesKeys.push(head);
                })
            });
            var unique = propertiesKeys.filter(function(elem, index, self) {
                return index === self.indexOf(elem);
            })
            
            var p = $('#csvFileContent');
            p[0].style.visibility = "visible";

            unique.forEach(function (key) {
                header.append("<th>" + key + "</th>")
            })

            csvFile.forEach(function (elt4) {
                table.append("<tr id='csv" + elt4.id + "'></tr>");
                unique.forEach(function (key) {
                    var row = document.getElementById('csv' + elt4.id);
                    var x = row.insertCell(-1);
                    x.innerHTML= "<td>" + elt4[key] + "</td>";
                })
            })
        }
    });
}
var eltIdentique = [];
var tab = []
$(document).ready(function(){
    $("#csv-file").change(handleFileSelect);
});
function createSendingElement() {

    csvFile.forEach(function (elt5) {
        deviceList.forEach(function (elt6) {
            if(elt5.id === elt6.id) {
                eltIdentique.push(elt5.id);
            }
        })
    })

    eltIdentique.forEach(function (ids) {
        csvFile.forEach(function (csv) {
            if(ids === csv['id']) {
                var result = deviceList.find(obj => {
                    return obj.id === ids
                })
                var sendingObject = {
                    "group_id" : result.group.id,
                    'profile_id' : result.profile.id,
                    "properties" : {}
                };
                if ((keyExist = "name" in csv) === true) {
                    sendingObject.name = csv.name;
                }
                if ((keyExist = "description" in csv) === true) {
                    sendingObject.description = csv.description;
                }
                if ((keyExist = "status" in csv) === true) {
                    sendingObject.status = csv.status;
                }

                for (let property in csv) {
                    if (property !== 'name' && property !== 'description' && property !== 'status' && property !== 'id') {
                        sendingObject.properties[property] = csv[property]
                    }
                }
                sendingObject.properties.external_id = result.properties.external_id
                tab.push(sendingObject);
            }
        })
    })
    /* $('#existElt').append("L'ID suivant existe dans les deux listes : " + elt.id + "</br>");
        var sendingElt ={
            "name": elt2.name,
            "group_id": elt.group.id,
            "profile_id": elt.profile.id,
            "properties": {
                "external_id": elt.properties.external_id
            }
        }
        console.log('sending element : ', sendingElt);
        $.ajax({
            url: "https://api-preprod.objenious.com/v2/devices/" + elt.id,
            method: "PUT",
            headers: {
                "x-token": token,
            },
            data: JSON.stringify(sendingElt),
        }) */
    // console.log('taille du device list : ', deviceList.length)
    // console.log('IDENTIQUE = ', identique);

    updateFunction ();
}

function updateFunction () {
    console.log('UPDTE', tab, eltIdentique);
    $("#updateBtn")[0].style.visibility = "visible";
}

$(document).ready(function(){
    $("#updateBtn").on('click', function () {
        $('#myModal')[0].style.visibility = "visible";
        $("body").css("overflow", "hidden");
    })
});
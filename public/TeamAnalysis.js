//GLOBALS
var keyArray = [];  //array of keys for every match data with the specified competition and team
var valArray = []; //array of val for every match data with the specified competition and team
var dataArray = []; //array of objects for each data point
var matchNumArray = [];

var datasets = [];

var autoGoalChart, autoGearChart, teleopGoalChart, teleopGearChart, hopperChart, intakeChart, autoHighDist, teleopHighDist, climbingChart, otherChart, baseLineChart;

function inputOtherCompetition(name){
    if(name=='Other')
        document.getElementById('otherCompetitionInput').innerHTML='Other Competition: <input type="text" id="otherCompetition" />';
    else
        document.getElementById('otherCompetitionInput').innerHTML='';
}

function runData(){

    var competition = document.getElementById("competition").value;
    var origCompetition = document.getElementById("competition").value;
    if (competition == "Other")
        competition = document.getElementById("otherCompetition").value;
    var teamNumber = document.getElementById("team_number").value;
    var matchNumber = document.getElementById("match_number").value;

    keyArray = [];
    valArray = [];
    matchNumArray = [];
    dataArray = [];
    var ref = firebase.database().ref();
    ref.on("value", function(snapshot) {
        keyArray = [];
                valArray = [];
                matchNumArray = [];
                dataArray = [];
        snapshot.forEach(function(childSnapshot) {  //go through each child (match data)
            var key = childSnapshot.key;
            var val = childSnapshot.val();
            var isCompetition = key.substr(0, competition.length) == competition;
            var isSelectCompetition = competition == "Select Competition";
            var isTeam = key.substr(key.indexOf("Team")+5, teamNumber.toString().length) == teamNumber;
            var match = key.substr(key.indexOf("Match")+6, key.indexOf(" ", key.substr(key.indexOf("Match")+6)));
            var isMatch = key.substr(key.indexOf("Match")+6, matchNumber.toString().length) == matchNumber;
            if ((isCompetition || isSelectCompetition) && isTeam && isMatch){
                keyArray.push(key);
                valArray.push(val);
                matchNumArray.push(match);
            }
        })
        for (var i = 0; i < keyArray.length; i++){
            var name = keyArray[i];
            var value = valArray[i];
            var data = {[name]: [value]};
            dataArray.push(data);
        }
        if (dataArray.length == 0) {
            console.log("No results found");
            alert("No results found!");
        }
        else{
            document.getElementById("rawData").innerHTML=JSONTree.create(dataArray)
            toggle("rawData");
            graphAutoGoals();
            graphTeleopGoals();
            graphHoppersTriggered();
            graphIntakeCapabilities();
            graphTeleopGearSuccess();
            graphAutoGearSuccess();
            graphAutoHighGoalDistance();
            graphTeleopHighGoalDistance();
            graphClimbing();
            tableComments();
            graphOther();
            graphBaseLine();

        }

    }, function (error) {
        console.log("Error: " + error.code);
    });
}

function parseData(keyArray, valArray, dataArray){
    for(var i = 0; i < valArray.length; i++){
        console.log(valArray[i].Comments.Comments);
    }
}

function graphAutoGoals(){

    //X-Axis Labels
    var allianceChartsType = "bar";
    var allianceChartsLabels = [];
    allianceChartsLabels.push("Average");
    matchNumArray.forEach(function(element){
        allianceChartsLabels.push(element);
    });

    //High Goals Data
    var highGoals = [], highGoalTotal = 0, highGoalCount = 0;
    highGoals.length = 0;
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/Autonomous/HighGoals/HighGoals/').once('value', function (snapshot) {
            highGoals.push(snapshot.val());
            highGoalTotal+=parseInt(snapshot.val());
            highGoalCount++;
        })});
    highGoals.splice(0, 0, Math.round(highGoalTotal/highGoalCount)); //add average to beginning

    //Low Goals Data
    var lowGoals = [], lowGoalTotal = 0, lowGoalCount = 0;
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/Autonomous/LowGoals/').once('value', function (snapshot) {
            lowGoals.push(snapshot.val());
            lowGoalTotal+=parseInt(snapshot.val());
            lowGoalCount++;
        })});
    lowGoals.splice(0, 0, Math.round(lowGoalTotal/lowGoalCount));

    //Datasets
    var datasets = [];
    datasets[0] =
        {
        label: "High Goals",
        backgroundColor: "rgba(255, 0, 0, 0.2)",
        borderColor: "rgba(255, 0, 0, 1)",
        data: highGoals
    };
    datasets[1] =
        {
        label: "Low Goals",
        backgroundColor: "rgba(255, 167, 0, 0.2)",
        borderColor: "rgba(255, 167, 0, 1)",
        data: lowGoals
    };
    var ctx = document.getElementById("auto_fuel").getContext('2d');
    if(autoGoalChart) {
        autoGoalChart.destroy();
    }
    autoGoalChart = new Chart(ctx, {
        type: allianceChartsType,
        data: {
            labels: allianceChartsLabels,
            datasets: datasets
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        stepSize: 1
                    }
                }]
            }
        }
    });

}

function graphAutoGearSuccess(){

    //X-Axis Labels
    var allianceChartsType = "pie";
    var allianceChartsLabels = ["No Attempt", "Drop", "Miss", "Score"];

    //Datasets
    var data = [0, 0, 0, 0];
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/Autonomous/Gears/').once('value', function (childSnapshot) {
            if(childSnapshot.val().GearScoring == "No Attempt") data[0]++;
            else if(childSnapshot.val().GearScoring == "Drop") data[1]++;
            else if(childSnapshot.val().GearScoring == "Miss") data[2]++;
            else if(childSnapshot.val().GearScoring == "Score") data[3]++;
        })});

    var ctx = document.getElementById("auto_gear_success").getContext('2d');
    if(autoGearChart) {
        autoGearChart.destroy();
    }
    autoGearChart = new Chart(ctx, {
        type: allianceChartsType,
        data: {
            labels: allianceChartsLabels,
            datasets: [
                {
                    data: data,
                    backgroundColor: [
                        "#818181",
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56"
                    ]
                }]
        }
    });

}

function graphTeleopGoals(){

    //X-Axis Labels
    var allianceChartsType = "bar";
    var allianceChartsLabels = [];
    allianceChartsLabels.push("Average");
    matchNumArray.forEach(function(element){
        allianceChartsLabels.push(element);
    });

    //High Goals Data
    var highGoals = [], highGoalTotal = 0, highGoalCount = 0;
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/Teleoperated/HighGoals/HighGoals/').once('value', function (snapshot) {
            highGoals.push(snapshot.val());
            highGoalTotal+=parseInt(snapshot.val());
            highGoalCount++;
        })});
    highGoals.splice(0, 0, Math.round(highGoalTotal/highGoalCount));

    //Low Goals Data
    var lowGoals = [], lowGoalTotal = 0, lowGoalCount = 0;
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/Teleoperated/LowGoals/').once('value', function (snapshot) {
            lowGoals.push(snapshot.val());
            lowGoalTotal+=parseInt(snapshot.val());
            lowGoalCount++;
        })});
    lowGoals.splice(0, 0, Math.round(lowGoalTotal/lowGoalCount));

    //Datasets
    var datasets = [];
    datasets[0] =
        {
        label: "High Goals",
        backgroundColor: "rgba(255, 0, 0, 0.2)",
        borderColor: "rgba(255, 0, 0, 1)",
        data: highGoals
    };
    datasets[1] =
        {
        label: "Low Goals",
        backgroundColor: "rgba(255, 167, 0, 0.2)",
        borderColor: "rgba(255, 167, 0, 1)",
        data: lowGoals
    };

    var ctx = document.getElementById("teleop_fuel").getContext('2d');
    if(teleopGoalChart) {
        teleopGoalChart.destroy();
    }
    teleopGoalChart = new Chart(ctx, {
        type: allianceChartsType,
        data: {
            labels: allianceChartsLabels,
            datasets: datasets
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        stepSize: 10
                    }
                }]
            }
        }
    });

}

function graphTeleopGearSuccess(){

    //X-Axis Labels
    var allianceChartsType = "pie";
    var allianceChartsLabels = ["Drop", "Miss", "Score"];

    //Datasets
    var data = [0, 0, 0];
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/Teleoperated/Gears/').once('value', function (childSnapshot) {
            for(var i = 0; i < parseInt(childSnapshot.val().length); i++){
                if(childSnapshot.val()[i].GearScoring == "Drop") data[0]++;
                else if(childSnapshot.val()[i].GearScoring == "Miss") data[1]++;
                else if(childSnapshot.val()[i].GearScoring == "Score") data[2]++;
            }
        })});

    var ctx = document.getElementById("teleop_gear_success").getContext('2d');
    if(teleopGearChart) {
        teleopGearChart.destroy();
    }
    teleopGearChart = new Chart(ctx, {
        type: allianceChartsType,
        data: {
            labels: allianceChartsLabels,
            datasets: [
                {
                    data: data,
                    backgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56"
                    ],
                    hoverBackgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56"
                    ]
                }]
        }
    });

}

function graphHoppersTriggered(){

    //X-Axis Labels
    var allianceChartsType = "bar";
    var allianceChartsLabels = [];
    allianceChartsLabels.push("Average");
    matchNumArray.forEach(function(element){
        allianceChartsLabels.push(element);
    });

    //Hoppers Data
    var hoppers = [], hoppersTotal = 0, hopperCount = 0;
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/Teleoperated/Hoppers/HoppersTriggered/').once('value', function (snapshot) {
            hoppers.push(snapshot.val());
            hoppersTotal+=parseInt(snapshot.val());
            hopperCount++;
        })});
    hoppers.splice(0, 0, Math.round(hoppersTotal/hopperCount));

    //Autonomous Data
    var count = 0;
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/Autonomous/Hoppers/HopperTriggered/').once('value', function (snapshot) {
            if (snapshot.val())
                hoppers[count]++;
            count++;
        })});

    //Datasets
    var datasets = [];
    datasets[0] =
        {
        label: "Hoppers Triggered",
        backgroundColor: "rgba(255, 0, 0, 0.2)",
        borderColor: "rgba(255, 0, 0, 1)",
        data: hoppers
    };

    var ctx = document.getElementById("hoppers_triggered").getContext('2d');
    if(hopperChart) {
        hopperChart.destroy();
    }
    hopperChart = new Chart(ctx, {
        type: allianceChartsType,
        data: {
            labels: allianceChartsLabels,
            datasets: datasets
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        stepSize: 1,
                        min: 0,
                        max: 5
                    }
                }]
            }
        }
    });

}

function graphIntakeCapabilities(){

    //X-Axis Labels
    var allianceChartsType = "bar";
    var allianceChartsLabels = ["Feeder", "Ground", "Hopper"];
    var fuelIntake = [0, 0, 0];
    var gearIntake = [0, 0, 0];

    var count = 0;
    keyArray.forEach(function(element){
        count = 0;
        allianceChartsLabels.forEach(function(label){
            firebase.database().ref('/' + element + '/RobotAbility/FuelIntake/FuelIntake' + label + '/').once('value', function (snapshot) {
                if (snapshot.val() == true){
                    fuelIntake[count]++;
                }
                count++;
            })});
    });

    keyArray.forEach(function(element){
        count = 0;
        allianceChartsLabels.forEach(function(label){
            firebase.database().ref('/' + element + '/RobotAbility/GearIntake/GearIntake' + label + '/').once('value', function (snapshot) {
                if (snapshot.val() == true){
                    gearIntake[count]++;
                }
                count++;
            })});
    });

    //Datasets
    datasets[0] =
        {
        label: "Fuel Intake Capability",
        backgroundColor: "rgba(255, 0, 0, 0.2)",
        borderColor: "rgba(255, 0, 0, 1)",
        data: fuelIntake
    };
    datasets[1] =
        {
        label: "Gear Intake Capability",
        backgroundColor: "rgba(255, 156, 0, 0.2)",
        borderColor: "rgba(255, 156, 0, 1)",
        data: gearIntake
    };
    var ctx = document.getElementById("intake_capabilities").getContext('2d');
    if(intakeChart) {
        intakeChart.destroy();
    }
    intakeChart = new Chart(ctx, {
        type: allianceChartsType,
        data: {
            labels: allianceChartsLabels,
            datasets: datasets,
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        stepSize: 1
                    }
                }]
            }
        }
    });

}

function graphAutoHighGoalDistance(){

    //X-Axis Labels
    var allianceChartsType = "pie";
    var allianceChartsLabels = ["Boiler", "Ranged"];

    //Datasets
    var data = [0, 0];
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/Autonomous/HighGoals/Distance/').once('value', function (childSnapshot) {
            if(childSnapshot.val() == "boiler") data[0]++;
            else if(childSnapshot.val() == "ranged") data[1]++;
        })});

    var ctx = document.getElementById("auto_high_goal_distance").getContext('2d');
    if(autoHighDist) {
        autoHighDist.destroy();
    }
    autoHighDist = new Chart(ctx, {
        type: allianceChartsType,
        data: {
            labels: allianceChartsLabels,
            datasets: [
                {
                    data: data,
                    backgroundColor: [
                        "#FF6384",
                        "#36A2EB"
                    ]
                }]
        }
    });

}

function graphTeleopHighGoalDistance(){

    //X-Axis Labels
    var allianceChartsType = "pie";
    var allianceChartsLabels = ["Boiler", "Ranged"];

    //Datasets
    var data = [0, 0];
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/Teleoperated/HighGoals/').once('value', function (childSnapshot) {
            if(childSnapshot.val().DistanceBoiler) data[0]++;
            if(childSnapshot.val().DistanceRanged) data[1]++;
        })});

    var ctx = document.getElementById("teleop_high_goal_distance").getContext('2d');
    if(teleopHighDist) {
        teleopHighDist.destroy();
    }
    teleopHighDist = new Chart(ctx, {
        type: allianceChartsType,
        data: {
            labels: allianceChartsLabels,
            datasets: [
                {
                    data: data,
                    backgroundColor: [
                        "#FF6384",
                        "#36A2EB"
                    ]
                }]
        }
    });

}

function graphClimbing(){

    //X-Axis Labels
    var allianceChartsType = "pie";
    var allianceChartsLabels = ["No Attempt", "Fail", "Success"];

    //Datasets
    var data = [0, 0, 0];
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/Teleoperated/EndGame/ClimbingScoring/').once('value', function (childSnapshot) {
            if(childSnapshot.val() == "no attempt") data[0]++;
            else if(childSnapshot.val() == "fail") data[1]++;
            else if(childSnapshot.val() == "success") data[2]++;
        })});

    var ctx = document.getElementById("climbing_chart").getContext('2d');
    if(climbingChart) {
        climbingChart.destroy();
    }
    climbingChart = new Chart(ctx, {
        type: allianceChartsType,
        data: {
            labels: allianceChartsLabels,
            datasets: [
                {
                    data: data,
                    backgroundColor: [
                        "#818181",
                        "#FF6384",
                        "#36A2EB"
                    ]
                }]
        }
    });

}

function tableComments(){
    var comments = [];
    var defenseComments = [];
    var count = 0;
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/Comments/Comments/').once('value', function (snapshot) {
            comments[count] = snapshot.val();
            count++;
        })});

    count = 0;
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/RobotAbility/Defense/').once('value', function (snapshot) {
            defenseComments[count] = snapshot.val();
            count++;
        })});

    var allComments = [comments, defenseComments];

    var headers = "\
<tr>\
<th>Match</th>\
<th>Comments</th> \
<th>Defense Comments</th>\
</tr>";

    var matchComments = [];
    var matches = [];
    keyArray.forEach(function(element){
        matches.push(element.substr(element.indexOf(" ", element.indexOf("Match"))));
    });
    for (var i = 0; i < matches.length; i++){
        matchComments += "<tr><td>" + matches[i] + "</td> <td>"+comments[i]+"</td> <td>"+defenseComments[i]+"</td></tr>";
    }

    document.getElementById('commentsTable').innerHTML='<table class="sortable" id="comments_table" width=100%>' + headers + matchComments + '</table>';
    sorttable.makeSortable(document.getElementById('comments_table'));
}

function graphOther(){

    //X-Axis Labels
    var allianceChartsType = "pie";
    var allianceChartsLabels = ["Died and Lost Comms", "Died", "Lost Comms", "None"];

    //Datasets
    var data = [0, 0, 0, 0];
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/Other/').once('value', function (childSnapshot) {
            if(childSnapshot.val().Died && childSnapshot.val().LostComms) data[0]++;
            else if(childSnapshot.val().Died) data[1]++;
            else if(childSnapshot.val().LostComms) data[2]++;
            else data[3]++;
        })});

    var ctx = document.getElementById("other_chart").getContext('2d');
    if(otherChart) {
        otherChart.destroy();
    }
    otherChart = new Chart(ctx, {
        type: allianceChartsType,
        data: {
            labels: allianceChartsLabels,
            datasets: [
                {
                    data: data,
                    backgroundColor: [
                        "#818181",
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56"
                    ]
                }]
        }
    });

}

function graphBaseLine(){

    //X-Axis Labels
    var allianceChartsType = "pie";
    var allianceChartsLabels = ["Crossed", "Did Not Cross"];

    //Datasets
    var data = [0, 0];
    keyArray.forEach(function(element){
        firebase.database().ref('/' + element + '/Autonomous/').once('value', function (childSnapshot) {
            if(childSnapshot.val().BaseLineCrossed) data[0]++;
            else data[1]++;
        })});

    console.log(data);
    
    var ctx = document.getElementById("base_line_chart").getContext('2d');
    if(baseLineChart) {
        baseLineChart.destroy();
    }
    otherChart = new Chart(ctx, {
        type: allianceChartsType,
        data: {
            labels: allianceChartsLabels,
            datasets: [
                {
                    data: data,
                    backgroundColor: [
                        "#818181",
                        "#FF6384"
                    ]
                }]
        }
    });

}
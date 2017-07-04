//GLOBALS
var keyArray = []; //array of keys for every match data with the specified competition and team
var valArray = []; //array of val for every match data with the specified competition and team
var dataArray = []; //array of objects for each data point

var maxAutoHG = 0,
    maxAutoLG = 0,
    maxHG = 0,
    maxLG = 0,
    maxGears = 0;
var team1MatchesPlayed = 0,
    team2MatchesPlayed = 0,
    team3MatchesPlayed = 0;

function inputOtherCompetition(name) {
    if (name == 'Other')
        document.getElementById('otherCompetitionInput').innerHTML = 'Other Competition: <input type="text" id="otherCompetition" />';
    else
        document.getElementById('otherCompetitionInput').innerHTML = '';
}

var teamDatasets = [];
var temp;

function filterDataParse(competition, teamNumber) {

    var keyArray = []; //array of keys for every match data with the specified competition and team
    var valArray = []; //array of val for every match data with the specified competition and team
    var dataArray = []; //array of objects for each data point

    var ref = firebase.database().ref();
    ref.on("value", function(snapshot) {
        var keyArray = []; //array of keys for every match data with the specified competition and team
        var valArray = []; //array of val for every match data with the specified competition and team
        var dataArray = []; //array of objects for each data point
        snapshot.forEach(function(childSnapshot) { //go through each child (match data)
            var key = childSnapshot.key;
            var val = childSnapshot.val();
            var successfulGears = 0;
            var isCompetition = key.substr(0, competition.length) == competition;
            if (isCompetition) { //max values for specified competition
                var totalCycleTime = 0;
                if (parseInt(val.Autonomous.HighGoals.HighGoals) > maxAutoHG) maxAutoHG = parseFloat(val.Autonomous.HighGoals.HighGoals);
                if (val.Autonomous.LowGoals > maxAutoLG) maxAutoLG = parseFloat(val.Autonomous.LowGoals);
                if (val.Teleoperated.HighGoals.HighGoals > maxHG) maxHG = parseFloat(val.Teleoperated.HighGoals.HighGoals);
                if (val.Teleoperated.LowGoals > maxLG) maxLG = parseFloat(val.Teleoperated.LowGoals);
                for (var i = 0; i < val.Teleoperated.Gears.length; i++)
                    totalCycleTime += parseFloat(val.Teleoperated.Gears[i].GearCycleTime);
                var num = parseFloat(val.Teleoperated.Gears.length / totalCycleTime);
                if (isNaN(num)) num = 0;
                if (num > maxGears) maxGears = parseFloat(num);
            }
            var isSelectCompetition = competition == "Select Competition";
            var isTeam = key.substr(key.indexOf("Team") + 5, teamNumber.toString().length) == teamNumber;
            if ((isCompetition || isSelectCompetition) && isTeam) {
                keyArray.push(key);
                valArray.push(val);
            }
        });
        for (var i = 0; i < keyArray.length; i++) {
            var name = keyArray[i];
            var value = valArray[i];
            var data = {
                [name]: [value] };
            dataArray.push(data);
        }
        if (dataArray.length == 0)
            console.log("No results found");
        else {
            temp = parseData(keyArray, valArray, dataArray, teamNumber);
            teamDatasets.push(temp);
        }
    }, function(error) {
        console.log("Error: " + error.code);
    });



}

function parseData(keyArray, valArray, dataArray, teamNumber) {

    var data = [0, 0, 0, 0, 0, 0];
    var totalNumMatches = keyArray.length;

    //Autonomous Fuel
    var autoHighGoals = 0;
    for (var i = 0; i < valArray.length; i++)
        autoHighGoals += parseInt(valArray[i].Autonomous.HighGoals.HighGoals);
    autoHighGoals /= valArray.length;

    var autoLowGoals = 0;
    for (var i = 0; i < valArray.length; i++)
        autoLowGoals += parseInt(valArray[i].Autonomous.LowGoals);
    autoLowGoals /= valArray.length;

    data[0] = (3 * autoHighGoals + autoLowGoals) / (3 * maxAutoHG + maxAutoLG);
    if (3 * maxAutoHG + maxAutoLG == 0) data[0] = 1;

    //Autonomous Gears
    var autoGearLocationsScore = 0;
    var autoGearLocations = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < valArray.length; i++) {
        if (valArray[i].Autonomous.Gears.GearLocation == 1 && valArray[i].PreMatch.Alliance == "red") autoGearLocations[0]++;
        if (valArray[i].Autonomous.Gears.GearLocation == 2 && valArray[i].PreMatch.Alliance == "red") autoGearLocations[1]++;
        if (valArray[i].Autonomous.Gears.GearLocation == 3 && valArray[i].PreMatch.Alliance == "red") autoGearLocations[2]++;
        if (valArray[i].Autonomous.Gears.GearLocation == 1 && valArray[i].PreMatch.Alliance == "blue") autoGearLocations[3]++;
        if (valArray[i].Autonomous.Gears.GearLocation == 2 && valArray[i].PreMatch.Alliance == "blue") autoGearLocations[4]++;
        if (valArray[i].Autonomous.Gears.GearLocation == 3 && valArray[i].PreMatch.Alliance == "blue") autoGearLocations[5]++;
    }
    for (var i = 0; i < autoGearLocations.length; i++)
        if (autoGearLocations[i] > 1)
            autoGearLocationsScore++; //should be from 0-6

    var successfulAutoGears = 0;
    for (var i = 0; i < valArray.length; i++)
        if (valArray[i].Autonomous.Gears.GearScoring == "Score") successfulAutoGears++;
    var droppedAutoGears = 0;
    for (var i = 0; i < valArray.length; i++)
        if (valArray[i].Autonomous.Gears.GearScoring == "Drop" ||
            valArray[i].Autonomous.Gears.GearScoring == "Miss") droppedAutoGears++;

    data[1] = ((autoGearLocationsScore / 6) + (successfulAutoGears + 0.2 * droppedAutoGears)) / totalNumMatches;

    //Teleop Fuel
    var highGoals = 0;
    for (var i = 0; i < valArray.length; i++)
        highGoals += parseInt(valArray[i].Teleoperated.HighGoals.HighGoals);
    highGoals /= valArray.length;

    var lowGoals = 0;
    for (var i = 0; i < valArray.length; i++)
        lowGoals += parseInt(valArray[i].Teleoperated.LowGoals);
    lowGoals /= valArray.length;

    data[2] = (3 * highGoals + lowGoals) / (3 * maxHG + maxLG);
    if (3 * maxHG + maxLG == 0) data[2] = 1;

    //Teleop Gears
    var gearCycleTime = 0;
    var count = 0;
    for (var i = 0; i < valArray.length; i++) //every data
        for (var j = 0; j < valArray[i].Teleoperated.Gears.length; j++) { //every gear in data
        count++;
        var nextTime = parseInt(valArray[i].Teleoperated.Gears[j].GearCycleTime);
        if (isNaN(nextTime)) nextTime = 0;
        gearCycleTime += nextTime;
    }
    gearCycleTime = gearCycleTime / count;
    if (count == 0) gearCycleTime = 0;

    var successfulGears = 0;
    var gearAttempts = 0;
    for (var i = 0; i < valArray.length; i++) //every data
        for (var j = 0; j < valArray[i].Teleoperated.Gears.length; j++) { //every gear in data
        if (valArray[i].Teleoperated.Gears[j].GearScoring == "Score") {
            successfulGears++;
            gearAttempts++;
        } else if (valArray[i].Teleoperated.Gears[j].GearScoring == "Miss" ||
            valArray[i].Teleoperated.Gears[j].GearScoring == "Drop")
            gearAttempts++;
    }
    gearCycleTime = parseFloat(gearCycleTime);

    data[3] = (successfulGears / gearCycleTime) / (maxGears);
    if (gearCycleTime == 0) data[3] = 0;

    //Climbing
    var successfulClimbs = 0;
    var climbAttempts = 0;
    for (var i = 0; i < valArray.length; i++) {
        if (valArray[i].Teleoperated.EndGame.ClimbingScoring == "success") {
            successfulClimbs++;
        } else if (valArray[i].Teleoperated.EndGame.ClimbingScoring == "fail")
            climbAttempts++;
    }
    data[4] = (climbAttempts * 0.25 + successfulClimbs) / totalNumMatches;


    //Reliability
    var lostComms = 0;
    for (var i = 0; i < valArray.length; i++)
        if (valArray[i].Other.LostComms)
            lostComms++;

    var died = 0;
    for (var i = 0; i < valArray.length; i++)
        if (valArray[i].Other.Died)
            died++;

    data[5] = 1 - (died + lostComms) / totalNumMatches;

    for (var i = 0; i < data.length; i++)
        data[i] = parseFloat(data[i]);

    return data;


}

var allianceChart;

function graphAlliance() {

    var competition = document.getElementById("competition").value;
    if (competition == "Other")
        competition = document.getElementById("otherCompetition").value;
    var team1Number = document.getElementById("team_1_number").value;
    var team2Number = document.getElementById("team_2_number").value;
    var team3Number = document.getElementById("team_3_number").value;

    //X-Axis Labels
    var allianceChartsType = "radar";
    var allianceChartsLabels = ["Auto Fuel", "Auto Gears", "Teleop Fuel", "Teleop Gears", "Climbing", "Reliability"];

    var team1Data = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        team2Data = [0, 0, 0, 0, 0, 0],
        team3Data = [0, 0, 0, 0, 0, 0];

    team1Data = filterDataParse(competition, team1Number);
    team2Data = filterDataParse(competition, team2Number);
    team3Data = filterDataParse(competition, team3Number);

    setTimeout(function() {
        console.log(teamDatasets[0]);
        //        console.log(teamDatasets[1]);
        //        console.log(teamDatasets[2]);

        //Datasets
        var datasets = [];
        datasets[0] = {
            label: team1Number,
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            borderColor: "rgba(255, 0, 0, 1)",
            data: teamDatasets[0]
        };
        datasets[1] = {
            label: team2Number,
            backgroundColor: "rgba(255, 167, 0, 0.2)",
            borderColor: "rgba(255, 167, 0, 1)",
            data: teamDatasets[1]
        };
        datasets[2] = {
            label: team3Number,
            backgroundColor: "rgba(255, 226, 0, 0.2)",
            borderColor: "rgba(255, 226, 0, 1)",
            data: teamDatasets[2]
        };
        var ctx = document.getElementById("alliance_canvas").getContext('2d');
        if (allianceChart)
            allianceChart.destroy();
        allianceChart = new Chart(ctx, {
            type: allianceChartsType,
            data: {
                labels: allianceChartsLabels,
                datasets: datasets
            },
            options: {
                scales: {
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1
                    }
                }
            }

        });
    }, 1000);


}
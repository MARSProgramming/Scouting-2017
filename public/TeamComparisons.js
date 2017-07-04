//GLOBALS
var keyArray = [];  //array of keys for every match data with the specified competition and team
var valArray = []; //array of val for every match data with the specified competition and team
var dataArray = []; //array of objects for each data point
var teams = [];

var competition;

var data = [];

//set in parseData()
//use in addTeamStats()
//temp variables
var autoBaseLine, autoGears, autoHighGoals, autoTotalHGAtBoiler, autoTotalHGAtRanged, autoLowGoals, autoHoppers;
var gears, gearSuccess, gearCycleTime, highGoals, totalHGAtBoiler, totalHGAtRanged, lowGoals, hoppers, climbSuccess;
var fuelFeeder, fuelGround, fuelHopper, gearFeeder, gearGround;
var died, lostComms, defense;
var rank, powerLevel;

//call addTeamStats for every team
function fillChart(){
    while(true){
        if (document.getElementById("table").rows.length > 2)
            document.getElementById("table").deleteRow(2);
        else
            break;
    }

    keyArray = [];
    valArray = [];
    dataArray = []
    competition = document.getElementById("competition").value;
    if (competition == "Other")
        competition = document.getElementById("otherCompetition").value;

    var ref = firebase.database().ref();
    ref.once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {  //go through each child (match data)
            var key = childSnapshot.key;
            var isCompetition = key.substr(0, competition.length) == competition;
            var isSelectCompetition = competition == "Select Competition";
            var teamNum = key.substr(key.indexOf("Team")+5, 4);
            if (isNaN(teamNum))
                teamNum = parseInt(teamNum.toString().substr(0, 2));
            if (isNaN(teamNum))
                teamNum = parseInt(teamNum.toString().substr(0, 1));
            if ((isCompetition || isSelectCompetition) && !isNaN(teamNum))
                teams.push(teamNum);//only if not already there
            teams = teams.filter( (el, i, arr) => arr.indexOf(el) === i);//removes duplicates
        });
        for (var i = 0; i < teams.length; i++)
            filterDataParse(competition, teams[i], "");
    }, function (error) {
        console.log("Error: " + error.code);
    });
}

function filterDataParse(competition, teamNumber, matchNumber){

    var keyArray = [];  //array of keys for every match data with the specified competition and team
    var valArray = []; //array of val for every match data with the specified competition and team
    var dataArray = []; //array of objects for each data point

    var ref = firebase.database().ref();
    ref.on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {  //go through each child (match data)
            var key = childSnapshot.key;
            var val = childSnapshot.val();
            //            console.log(childSnapshot);
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
            var isTeam = key.substr(key.indexOf("Team")+5, teamNumber.toString().length) == teamNumber;
            var isMatch = key.substr(key.indexOf("Match")+6, matchNumber.toString().length) == matchNumber;
            if ((isCompetition || isSelectCompetition) && isTeam && isMatch){
                keyArray.push(key);
                valArray.push(val);
            }
        });
        for (var i = 0; i < keyArray.length; i++){
            var name = keyArray[i];
            var value = valArray[i];
            var data = {[name]: [value]};
            dataArray.push(data);
        }
        if (dataArray.length == 0)
            console.log("No results found");
        else{
            parseData(keyArray, valArray, dataArray, teamNumber);
        }
    }, function (error) {
        console.log("Error: " + error.code);
    });
}

function parseData(keyArray, valArray, dataArray, teamNumber){
    defense = 0
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].RobotAbility.Defense != "")
            defense++;

    lostComms = 0;
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].Other.LostComms)
            lostComms++;

    died = 0;
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].Other.Died)
            died++;

    gearGround = 0;
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].RobotAbility.GearIntake.GearIntakeGround)
            gearGround++;

    gearFeeder = 0;
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].RobotAbility.GearIntake.GearIntakeFeeder)
            gearFeeder++;

    fuelHopper = 0;
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].RobotAbility.FuelIntake.FuelIntakeHopper)
            fuelHopper++;

    fuelGround = 0;
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].RobotAbility.FuelIntake.FuelIntakeGround)
            fuelGround++;

    fuelFeeder = 0;
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].RobotAbility.FuelIntake.FuelIntakeFeeder)
            fuelFeeder++;

    var successfulClimbs = 0;
    var climbAttempts = 0;
    for(var i = 0; i < valArray.length; i++){
        if(valArray[i].Teleoperated.EndGame.ClimbingScoring == "success"){
            successfulClimbs++;
            climbAttempts++;
        }
        else if(valArray[i].Teleoperated.EndGame.ClimbingScoring == "fail")
            climbAttempts++;
    }
    climbSuccess = successfulClimbs + "/" + climbAttempts;

    hoppers = 0;
    for(var i = 0; i < valArray.length; i++)
        hoppers += parseInt(valArray[i].Teleoperated.Hoppers.HoppersTriggered);
    hoppers /= valArray.length;

    lowGoals = 0;
    for(var i = 0; i < valArray.length; i++)
        lowGoals += parseInt(valArray[i].Teleoperated.LowGoals);
    lowGoals /= valArray.length;

    totalHGAtRanged = 0;
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].Teleoperated.HighGoals.DistanceRanged)
            totalHGAtRanged++;

    totalHGAtBoiler = 0;
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].Teleoperated.HighGoals.DistanceBoiler)
            totalHGAtBoiler++;

    highGoals = 0;
    for(var i = 0; i < valArray.length; i++)
        highGoals += parseInt(valArray[i].Teleoperated.HighGoals.HighGoals);
    highGoals /= valArray.length;

    gearCycleTime = 0;
    var count = 0;
    for(var i = 0; i < valArray.length; i++)//every data
        for(var j = 0; j < valArray[i].Teleoperated.Gears.length; j++){//every gear in data
            count++;
            var nextTime = parseInt(valArray[i].Teleoperated.Gears[j].GearCycleTime);
            if (isNaN(nextTime)) nextTime = 0;
            gearCycleTime += nextTime;
        }
    gearCycleTime = gearCycleTime / count;

    var successfulGears = 0;
    var gearAttempts = 0;
    for(var i = 0; i < valArray.length; i++)//every data
        for(var j = 0; j < valArray[i].Teleoperated.Gears.length; j++){//every gear in data
            if(valArray[i].Teleoperated.Gears[j].GearScoring == "Score"){
                successfulGears++;
                gearAttempts++;
            }
            else if (valArray[i].Teleoperated.Gears[j].GearScoring == "Miss" ||
                     valArray[i].Teleoperated.Gears[j].GearScoring == "Drop")
                gearAttempts++;
        }
    gearSuccess = successfulGears + "/" + gearAttempts;

    gears = successfulGears / valArray.length;

    autoHoppers = 0;
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].Autonomous.Hoppers.HopperTriggered) autoHoppers++;
    autoHoppers /= valArray.length;

    autoLowGoals = 0;
    for(var i = 0; i < valArray.length; i++)
        autoLowGoals += parseInt(valArray[i].Autonomous.LowGoals);
    autoLowGoals /= valArray.length;

    autoTotalHGAtRanged = 0;
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].Autonomous.HighGoals.Distance == "ranged")
            autoTotalHGAtRanged++;

    autoTotalHGAtBoiler = 0;
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].Teleoperated.HighGoals.Distance == "boiler")
            autoTotalHGAtBoiler++;

    autoHighGoals = 0;
    for(var i = 0; i < valArray.length; i++)
        autoHighGoals += parseInt(valArray[i].Autonomous.HighGoals.HighGoals);
    autoHighGoals /= valArray.length;

    var successfulAutoGears = 0;
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].Autonomous.Gears.GearScoring == "Score")
            successfulAutoGears++;
    autoGears = successfulAutoGears / valArray.length;

    autoBaseLine = 0;
    for(var i = 0; i < valArray.length; i++)
        if(valArray[i].Autonomous.BaseLineCrossed)
            autoBaseLine++;

    rank = "TBD";
    powerLevel = Math.round(10*calcPowerRating(keyArray, valArray, dataArray, teamNumber))/10;

    teamNumber = parseInt(teamNumber);

    data = [defense, lostComms, died, gearGround, gearFeeder, fuelHopper, fuelGround, fuelFeeder, climbSuccess, hoppers, lowGoals, totalHGAtRanged, totalHGAtBoiler, highGoals, gearCycleTime, gearSuccess, gears, autoHoppers, autoLowGoals, autoTotalHGAtRanged, autoTotalHGAtBoiler, autoHighGoals, autoGears, autoBaseLine, rank, powerLevel, teamNumber];//to fill with filtered data

    for( var i = 0; i < data.length; i++)
        if (typeof data[i] == "Number")
            data[i] = Math.round(10*data[i])/10;
    
    //Adds cells to table
    var numRows = 27;
    var row = document.getElementById("table").insertRow(2);
    for(var i = 0; i < numRows;i++) //for every col
        row.insertCell(0).innerHTML = data[i];//add cell with data
}


function inputOtherCompetition(name){
    if(name=='Other')
        document.getElementById('otherCompetitionInput').innerHTML='Other Competition: <input type="text" id="otherCompetition" />';
    else
        document.getElementById('otherCompetitionInput').innerHTML='';
}

function test(){
    console.log("test() started running.");
    console.log(document.getElementById("competition").value);
}

var maxAutoHG = 0,
    maxAutoLG = 0,
    maxHG = 0,
    maxLG = 0,
    maxGears = 0;

function calcPowerRating(keyArray, valArray, dataArray, teamNumber) {

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

    var total = 0;
    for (var i = 0; i < data.length; i++)
        total += data[i];
    
    return total;

}
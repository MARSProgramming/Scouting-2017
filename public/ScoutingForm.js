function changeMapRed() {
    console.log("clicked");

    var img = document.getElementById("mapimage");
    img.src = "RedSheet.png";
}

function changeMapBlue() {
    console.log("clicked");

    var img = document.getElementById("mapimage");
    img.src = "BlueSheet.png";
}



function increment(increaseValue, tagID) {
    console.log("run");
    var currentValue = Number(document.getElementById(tagID).value);
    console.log(currentValue);
    if (currentValue + increaseValue < 0) {
        document.getElementById(tagID).value = 0;
    } else {
        document.getElementById(tagID).value = currentValue + increaseValue;
    }

    console.log(document.getElementById(tagID).value);
}


function getHippo() {
    console.log("banana");
    alert('THANK YOU BIFF!!!');
}

function writeNewPost() {

    "use strict";

    //variables for all of Pre-Match inputs
    var scoutName = document.getElementById("scout_name").value;
    if (scoutName == null || scoutName == "")
        scoutName = "";
    var scoutTeam = document.getElementById("scout_team").value;
    if (scoutTeam == null || scoutTeam == "")
        scoutTeam = "";
    var competition = document.getElementById("competition").value;
    if (competition == "Other")
        competition = document.getElementById("otherCompetition").value;
    var matchNumber = document.getElementById("match_number").value;
    if (matchNumber == null || matchNumber == "")
        matchNumber = "No Match Number";
    var teamNumber = document.getElementById("team_number").value;
    if (teamNumber == null || teamNumber == "")
        teamNumber = "No Team Number";
    var alliance = document.getElementsByName('alliance');
    var allianceValue;
    for (var i = 0; i < alliance.length; i++) {
        if (alliance[i].checked) {
            allianceValue = alliance[i].value;
            break;
        }
    }
    if (allianceValue == null || allianceValue == "")
        allianceValue = "";

    //variables for all of Autonomous inputs
    var startingPosition = document.getElementsByName('starting_position');
    var startingPositionValue;
    for (var i = 0; i < startingPosition.length; i++) {
        if (startingPosition[i].checked) {
            startingPositionValue = startingPosition[i].value;
            break;
        }
    }
    if (startingPositionValue == null || startingPositionValue == "")
        startingPositionValue = "defaultPosition";
    var autoGearScoring = document.getElementById("auto_gear_scoring").value;
    if (autoGearScoring == null || autoGearScoring == "")
        autoGearScoring = "defaultNoAttempt";
    var autoGearLocation = document.getElementsByName('auto_gear_location');
    var autoGearLocationValue;
    for (var i = 0; i < autoGearLocation.length; i++) {
        if (autoGearLocation[i].checked) {
            autoGearLocationValue = autoGearLocation[i].value;
            break;
        }
    }
    if (autoGearLocationValue == null || autoGearLocationValue == "")
        autoGearLocationValue = "defaultAutoGearLocation";
    var autoHighGoals = document.getElementById("auto_high_goals").value;
    if (autoHighGoals == null || autoHighGoals == "")
        autoHighGoals = 0;
    var autoHighGoalsDistance = document.getElementsByName('auto_high_goals_distance');
    var autoHighGoalsDistanceValue;
    for (var i = 0; i < autoHighGoalsDistance.length; i++) {
        if (autoHighGoalsDistance[i].checked) {
            autoHighGoalsDistanceValue = autoHighGoalsDistance[i].value;
            break;
        }
    }
    if (autoHighGoalsDistanceValue == null || autoHighGoalsDistanceValue == "")
        autoHighGoalsDistanceValue = "defaultAutoHGDistance";
    var autoLowGoals = document.getElementById("auto_low_goals").value;
    if (autoLowGoals == null || autoLowGoals == "")
        autoLowGoals = 0;
    var autoHoppersTriggered = document.getElementById("auto_hoppers_triggered").checked ? true : false;
    var autoBaseLineCrossed = document.getElementById("auto_base_line_crossed").checked ? true : false;
    var autoFuelFromHoppers = document.getElementById("auto_fuel_from_hoppers").value;
    if (autoFuelFromHoppers == null || autoFuelFromHoppers == "")
        autoFuelFromHoppers = 0;

    //variables for all of the Teleoperated inputs
    var gearScoringObjects = [];
    var newGearScoringObjects = [];
    var gearScoringArray = document.getElementsByName("gear_scoring");
    var gearCycleTimeArray = document.getElementsByName("gear_cycle_time");
    for (var i = 0; i < gearScoringArray.length; i++) {
        var tempGearScoring = gearScoringArray[i].value;
        if (tempGearScoring == null || tempGearScoring == "")
            tempGearScoring = "default";
        var tempGearCycleTime = gearCycleTimeArray[i].value;
        if (tempGearCycleTime == null || tempGearCycleTime == "")
            tempGearCycleTime = 0;
        var gearScoring = {
            "GearScoring": tempGearScoring,
            "GearCycleTime": tempGearCycleTime
        }
        newGearScoringObjects.push(tempGearScoring);
        newGearScoringObjects.push(tempGearCycleTime);
        gearScoringObjects[i] = gearScoring;
    }
    var highGoals = document.getElementById("high_goals").value;
    if (highGoals == null || highGoals == "")
        highGoals = 0;

    var highGoalDistanceBoiler = document.getElementById("high_goal_distance_boiler").checked ? true : false;
    var highGoalDistanceRanged = document.getElementById("high_goal_distance_ranged").checked ? true : false;
    var lowGoals = document.getElementById("low_goals").value;
    if (lowGoals == null || lowGoals == "")
        lowGoals = 0;
    var boilerVisitsHigh = document.getElementById("boiler_visits_high").value;
    if (boilerVisitsHigh == null || boilerVisitsHigh == "")
        boilerVisitsHigh = 0;
    var boilerVisitsLow = document.getElementById("boiler_visits_low").value;
    if (boilerVisitsLow == null || boilerVisitsLow == "")
        boilerVisitsLow = 0;
    var hoppersTriggered = document.getElementById("hoppers_triggered").value;
    if (hoppersTriggered == null || hoppersTriggered == "")
        hoppersTriggered = 0;
    var fuelFromHoppers = document.getElementById("fuel_from_hoppers").value;
    if (fuelFromHoppers == null || fuelFromHoppers == "")
        fuelFromHoppers = 0;
    var gearScoring = document.getElementsByName("gear_scoring");
    if (gearScoring == null || gearScoring == "")
        gearScoring = "default";
    var climbingScoring = document.getElementsByName("climbing_scoring");
    var climbingScoringValue;
    for (var i = 0; i < climbingScoring.length; i++) {
        if (climbingScoring[i].checked) {
            climbingScoringValue = climbingScoring[i].value;
            break;
        }
    }
    if (climbingScoringValue == null || climbingScoringValue == "")
        climbingScoringValue = "default";
    var climbLocation = document.getElementsByName('climb_location');
    var climbLocationValue;
    for (var i = 0; i < climbLocation.length; i++) {
        if (climbLocation[i].checked) {
            climbLocationValue = climbLocation[i].value;
            break;
        }
    }
    if (climbLocationValue == null || climbLocationValue == "")
        climbLocationValue = "default";

    //variables for all of the Robot Ability inputs
    var defense = document.getElementById("defense").value;
    if (defense == null || defense == "")
        defense = "";
    var fuelIntakeGround = document.getElementById("fuel_intake_ground").checked ? true : false;
    var fuelIntakeFeeder = document.getElementById("fuel_intake_feeder").checked ? true : false;
    var fuelIntakeHopper = document.getElementById("fuel_intake_hopper").checked ? true : false;
    var gearIntakeGround = document.getElementById("gear_intake_ground").checked ? true : false;
    var gearIntakeFeeder = document.getElementById("gear_intake_feeder").checked ? true : false;

    //variables for all of the Other inputs
    var died = document.getElementById("died").checked ? true : false;
    var lostComms = document.getElementById("lost_comms").checked ? true : false;

    //variables for all of Comments inputs
    var comments = document.getElementById("comments").value;
    if (comments == null || comments == "")
        comments = "";

    var datas = [scoutName, scoutTeam, teamNumber, matchNumber, allianceValue, startingPositionValue, autoBaseLineCrossed, autoGearScoring, autoGearLocationValue, autoHighGoals, autoHighGoalsDistanceValue, autoLowGoals, autoHoppersTriggered, highGoals, lowGoals, climbingScoringValue, climbLocationValue, "", fuelIntakeFeeder, fuelIntakeGround, fuelIntakeHopper, gearIntakeFeeder, gearIntakeGround, died, lostComms, comments];
    var bigDaddy = datas.concat(newGearScoringObjects);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "https://script.google.com/macros/s/AKfycbxDVIjzjpKL45LtRJpYT2AroUjJK5xBM1bi8tEuBprjsbovqqY/exec?potato=" + bigDaddy, true);
    xhr.send();

    var postData = {
        "Data": {
            "DateTime": Date(),
            "PreMatch": {
                "ScoutName": scoutName,
                "ScoutTeam": scoutTeam,
                "CompetitionName": competition,
                "MatchNumber": matchNumber,
                "TeamNumber": teamNumber,
                "Alliance": allianceValue,
            },
            "Autonomous": {
                "StartLocation": startingPositionValue,
                "Gears": {
                    "GearScoring": autoGearScoring,
                    "GearLocation": autoGearLocationValue
                },
                "HighGoals": {
                    "HighGoals": autoHighGoals,
                    "Distance": autoHighGoalsDistanceValue
                },
                "LowGoals": autoLowGoals,
                "Hoppers": {
                    "HopperTriggered": autoHoppersTriggered,
                    "FuelFromHoppers": autoFuelFromHoppers
                },
                "BaseLineCrossed": autoBaseLineCrossed
            },
            "Teleoperated": {
                "Gears": gearScoringObjects,
                "HighGoals": {
                    "HighGoals": highGoals,
                    "DistanceBoiler": highGoalDistanceBoiler,
                    "DistanceRanged": highGoalDistanceRanged
                },
                "LowGoals": lowGoals,
                "BoilerVisits": {
                    "BoilerVisitsHigh": boilerVisitsHigh,
                    "BoilerVisitsLow": boilerVisitsLow
                },
                "Hoppers": {
                    "HoppersTriggered": hoppersTriggered,
                    "FuelFromHoppers": fuelFromHoppers
                },
                "EndGame": {
                    "ClimbingScoring": climbingScoringValue,
                    "ClimbLocation": climbLocationValue
                }
            },
            "RobotAbility": {
                "Defense": defense,
                "FuelIntake": {
                    "FuelIntakeGround": fuelIntakeGround,
                    "FuelIntakeFeeder": fuelIntakeFeeder,
                    "FuelIntakeHopper": fuelIntakeHopper
                },
                "GearIntake": {
                    "GearIntakeGround": gearIntakeGround,
                    "GearIntakeFeeder": gearIntakeFeeder
                }
            },
            "Other": {
                "Died": died,
                "LostComms": lostComms
            },
            "Comments": {
                "Comments": comments
            }
        }
    };


    //renames the outmost hierarchy of JSON which makes no duplicates
    postData = JSON.stringify(postData);
    postData = postData.replace("\"Data\"", "\"" + competition + " | Team " + teamNumber + " | Qualification Match " + matchNumber + "\"");
    postData = JSON.parse(postData);

    window.alert("Thank you for submitting!");
    firebase.database().ref().update(postData);

    //    if(window.confirm("Are you ready to submit your data?")){
    //        //update data on firebase
    //        firebase.database().ref().update(postData);
    //    }
}

var gearScoringCounter = 2;

function addGearScoringInput(divName) {
    var newdiv = document.createElement('div');
    newdiv.innerHTML = "Gear Scoring " + gearScoringCounter + ": \
<select class='form-control' name='gear_scoring' id='gear_scoring'>\
                    <option selected>No Attempt</option>\
                    <option value='Drop'>Drop</option>\
                    <option value='Miss'>Miss</option>\
                    <option value='Score'>Score</option>\
                </select>\
Cycle Time <input type='number' class='form-control' pattern='\d' name='gear_cycle_time' id='gear_cycle_time' placeholder='sec' min='0' max='150' />\
<br>";

    document.getElementById(divName).appendChild(newdiv);
    gearScoringCounter++;
}

function inputOtherCompetition(name) {
    if (name == 'Other')
        document.getElementById('otherCompetitionInput').innerHTML = 'Other Competition: <input type="text" id="otherCompetition" />';
    else
        document.getElementById('otherCompetitionInput').innerHTML = '';
}



function hideUnnecessaryElements() {

    if (document.getElementById("auto_gear_scoring").value == "No Attempt")
        document.getElementById("auto_gear_location_div").style.display = 'none';
    else
        document.getElementById("auto_gear_location_div").style.display = '';

    if (document.getElementById("auto_high_goals").value == 0)
        document.getElementById("auto_high_goals_distance_div").style.display = 'none';
    else
        document.getElementById("auto_high_goals_distance_div").style.display = '';

    if (document.getElementById("high_goals").value == 0)
        document.getElementById("high_goal_distance_div").style.display = 'none';
    else
        document.getElementById("auto_high_goals_distance_div").style.display = '';

    if (document.getElementById("climbing_success").checked ||
        document.getElementById("climbing_fail").checked)
        document.getElementById("climb_location_div").style.display = '';
    else
        document.getElementById("climb_location_div").style.display = 'none';

    setTimeout(hideUnnecessaryElements, 500);
}

var helpOpen = false;

var timer = false;

function showHelp() {
    if (helpOpen) {
        $('[data-toggle="popover"]').popover("hide");
        $('[data-toggle="tooltip"]').tooltip("hide");
        helpOpen = false;
    } else {
        $('[data-toggle="popover"]').popover("show");
        $('[data-toggle="tooltip"]').tooltip("show");
        helpOpen = true;
    }
}


function showTimer() {
    if (timer) {
        document.getElementById("timer").style.display = '';
        timer = false;
    } else {
        document.getElementById("timer").style.display = 'none';
        timer = true;
    }
}
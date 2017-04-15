import { Tracker } from 'meteor/tracker';


var landSize;
var blockSize = 150;
var landSrc = "/img/game/land.svg";

var prefix = "/img/game/";
var postfix = ".svg";

var currentCropId;
var plantMode = false;
var cropList = [];
var _dep = new Tracker.Dependency;


var cropTypeList = [
  {
    id:0,
    name: "Carrot",
    img: ["seed", "carrot_half", "carrot"],
    count:0

  },
  {
    id:1,
    name: "Radish",
    img: ["seed", "grass", "radish"],
    count:0
  }

];

///////////////////////////
//  prototype functions  //
///////////////////////////

Date.prototype.addTime = function(days, hours, minutes, seconds) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  dat.setHours(dat.getHours() + hours);
  dat.setMinutes(dat.getMinutes() + minutes);
  dat.setSeconds(dat.getSeconds() + seconds);

  return dat;
}

//////////////////
//  onRendered  //
//////////////////

Template.gameIndex.rendered = function() {
    if(!this._rendered) {
      console.log('gameArea render complete');
      farmObjectLoader();

      setInterval(cropSummaryUpdate, 1000);



    }
}

Template.shop.rendered = function () {
    $.getJSON('property.json', function (property_data) {
        for (i = 0; i < property_data.length; i++) {
            property_database.push(property_data[i]);
            display_field.push(property_data[i]);
        }
    });
    $.getJSON('test.json', function (user_data) {
        property_log = user_data;
    })
    .done(function () {
        var select = $('<select>></select>');
        for (i = 0; i < property_log.length; i++) {
            option = $('<option>', {
                value: property_log[i].account,
                text: property_log[i].account
            });
            select.append(option);
        }
        select.on('change', function () {
            activated_account = $(this).val();
            set_property_table();
        })
        $('.shop_header').append(select);
    })
    .fail(function (jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.log("Request Failed: " + err);
    });
    console.log("rend");

}


///////////////
//  Helpers  //
///////////////

var activated_account = 0;
var account_index;
property_log = [];
user_property = [];
property_database = [];
display_field = [];

Template.shop.helpers({

});

Template.statusList.helpers({
  crops: function(){

    var cropsData = [];

    for (var i = 0 ; i < cropTypeList.length; i++){
      var data = cropTypeList[i];

      //console.log(data);
      cropsData.push({
        "name": "crop property"+data.id,
        "img": prefix+data.img[2]+postfix,
        "content": data.name
      });
    }


    return cropsData;



  },
  cropsSummary: function(){
    var cropsData = [];

    for (var i = 0 ; i < cropList.length; i++){
      var data = cropList[i];

      //console.log(data);
      cropsData.push({
        "name": data.name,
        "img": prefix+data.img+postfix,
        "timeLeft": data.timeLeft
      });
    }

    _dep.depend();
    return cropsData;



  },
});


//////////////
//  Events  //
//////////////

Template.shop.events({
    'click #btn_show_property': function () {
        set_property_table();
    },
    'click #btn_shop_close': function () {
        $('.property_shop').css('display', 'none');
    }
});


Template.gameIndex.events({
  'click .cropObject': function (event){
      // var left = $(event.target).position().left;
      // var top = $(event.target).position().top;

        console.log("gg");
        if (currentCropId != null && plantMode){
          cropTypeList[currentCropId].count++;
        }else{
          alert("Specify Crop first");
          return;
        }

        $( ".cropObject" ).clone().attr("class","croppedObject").appendTo(".landObject").css({opacity:1});

        //var start = Date.now();
        var start = new Date();
        var end = new Date();

        end = end.addTime(1, 0, 0, 30);
        console.log(start);
        console.log(end);

        var difference = elapsedTime(start, end);
        console.log(difference.getDate());
        console.log(difference.getSeconds());
        var diffData = difference.getHours()+'.'+difference.getMinutes()+'.'+difference.getSeconds();

        cropList.push({
          name: cropTypeList[currentCropId].name,
          img:cropTypeList[currentCropId].img[2],
          since: start,
          timeLeft: diffData
        });
        console.log(cropList);
        _dep.changed();






  },
})

var panelCounter = 1, panelCount = 3;

Template.crop.events({
  'click .crop button': function (event){
      var id = $(event.target).parent()[0].className.split("property")[1];
      $(".cropObject").html("<img src = '" + prefix+ cropTypeList[id].img[0] + postfix +"' />");
      currentCropId = id;

      plantMode = !plantMode;
      if (plantMode){
          $(event.target).css("background", "gray");
          $(event.target).css("border-color", "gray");
          $(event.target).text("Done");
      }else{
          $(event.target).css("background", "#337ab7");
          $(event.target).css("border-color", "#337ab7");
          $(event.target).text("Specify");

      }
  },

})

Template.gamingArea.events({
  'mouseenter .land div': function (event){
      console.log("enter");
      var top = $(event.target)[0].getBoundingClientRect().top;
      var left = $(event.target)[0].getBoundingClientRect().left;

      var landTop = $(".land").position().top;
      var landLeft = $(".land").position().left;

      var areaLeft = $(".gamingArea").position().left;

      var divHeight =$(".cropObject").height()/5;
      var divWidth = $(".cropObject").width()/4;
      // var divHeight =0;
      // var divWidth = 0;

      $(".cropObject").css({top: top-divHeight, left: left-areaLeft+divWidth, width:"150px", height:"150px", position:"absolute", opacity:0.5});

  },
})

Template.statusList.events({
  'click .btn-info': function (e) {

      var temp = panelCounter;
      $(".statusPanel:nth-child("+panelCounter+")").removeClass("statusPanelShow");
      $(".statusPanel:nth-child("+temp+")").css("z-index", -1);

      // setTimeout(function(){
      //   $(".statusPanel:nth-child("+temp+")").css("z-index", -1);
      // },1000);

      panelCounter = e.target.className.split("crop")[1];

      $(".statusPanel:nth-child("+panelCounter+")").css("z-index", 1);
      $(".statusPanel:nth-child("+panelCounter+")").addClass("statusPanelShow");






  },
})




/////////////////////////
//  Utility Functions  //
/////////////////////////

var cropSummaryUpdate = function(){

    for (var i = 0 ; i < cropList.length ; i++){

    }
}

var elapsedTime = function(start, end){


    var elapsed = end - start; // time in milliseconds

    var difference = new Date(elapsed);

    var diff_days = difference.getDate();
    var diff_hours = difference.getHours();
    var diff_mins = difference.getMinutes();
    var diff_secs = difference.getSeconds();
    return difference;
    //return (diff_days, diff_hours, diff_mins, diff_secs);

}



var farmObjectLoader = function(){
    landSize = 3;
    $('.land').css("width", blockSize*landSize );
    $('.land').css("height", blockSize*landSize );

    for (var i = 0 ; i < landSize*landSize; i++){
        $('.land').append("<div class='farm cropLand" + i + "'><img src="+ landSrc +"></img></div>");
        //$('.land').append("<div></div>");
    }
}


/////////////////////////
//  Shop Functions  //
/////////////////////////

get_user_property_setting = function () {
    for (i = 0; i < property_log.length; i++) {
        if (activated_account == property_log[i].account) {
            user_property = property_log[i].property;
            account_index = i;
        }
    }

    for (i = 0; i < display_field.length; i++) {
        display_field.rating = 0;
        display_field.propertyCount =0;
        for (j = 0; j < user_property.length; j++){
            if (user_property[j].id == display_field[i].id) {
                display_field[i].rating = user_property[j].rating;
                display_field[i].propertyCount = user_property[j].propertyCount;
                display_field[i].tradeable = user_property[j].tradeable;                
                break;
            }
        }
    }
}

set_property_table = function () {

    var table, tr, td, heart_path, heart_status,property_index;

    heart_path = ['./img/heart-outline.png','./img/heart_filled.png'];
 
    get_user_property_setting();
    $('.shop_content').html('');
    table = $('<table></table>').attr('id', 'property_table');
    //header
    tr = $('<tr></tr>');
    tr.append($('<th></th>').text('Property'));
    tr.append($('<th></th>').text('Stock'));
    tr.append($('<th></th>').text('Rating'));
    tr.append($('<th></th>').text('AVG Rating'));
    tr.append($('<th></th>').text('Favorite'));
    table.append(tr);
    //header
    //content
    for (i = 0; i < display_field.length; i++) {
        tr = $('<tr></tr>');
        tr.append($('<td></td>').text(display_field[i].name));
        tr.append($('<td></td>').text(display_field[i].propertyCount));
        td = $('<td></td>');
        td.append($('<input>', {
            type: 'range',
            value: display_field[i].rating,
            max: 5,
            min: 0,
            step: 1,
            id: 'rating' + i
        }).on('change', function () {
            $('label[for = ' + $(this).attr('id') + ']').html($(this).val());
        })
        );
        td.append($('<label>').attr('for', 'rating' + i).html(display_field[i].rating));
        tr.append(td);
        tr.append($('<td></td>').text(display_field[i].averageRating));
        heart_status = display_field[i].tradeable;
        tr.append(
            $('<td></td>').append(
               $('<img></img>').attr('src', heart_path[display_field[i].tradeable])
                               .attr('heart_status',display_field[i].tradeable)
                               .attr('property_index',i)
                               .css('width', '30px')
                               .css('height', '30px')
                               .on('click', function(){
                                   property_index = $(this).attr('property_index');
                                   if( $(this).attr('heart_status') == 0)
                                   {
                                       $(this).attr('heart_status', 1);
                                   }
                                   else
                                   {
                                       $(this).attr('heart_status', 0);
                                       heart_status =0;
                                   }
                                   add_to_favorite(account_index, property_index,$(this).attr('heart_status'));
                                   $(this).attr('src', heart_path[$(this).attr('heart_status')]);
                                  // $(this).attr('heart_status', heart_status);
                               })));
        table.append(tr);
    }
    //content
    //control bar
    tr = $('<tr></tr>');
    td = $('<td></td>').attr('colspan', 3);
    td.append($('<input>').attr( {
        type: 'button',
        id: 'btn_property_save',
        value: 'SAVE'
    }).on('click', function () {
        save_rating_setting();
    }));
    td.append($('<input>').attr( {
        type: 'button',
        id: 'btn_property_cancel',
        value: 'CANCEL'
    }).on('click', function () {
        alert('cancel');
    }));
    td.append($('<input>').attr({
        type: 'text',
        id: 'json_temp',
        value: ''}));
    tr.append(td);
    table.append(tr);
    //control bar
    $('.shop_content').append(table);
}

add_to_favorite = function(_account_index, _property_index,_heart_status){
    property_log[_account_index].property[_property_index].tradeable =  _heart_status;
    $('#json_temp').val(JSON.stringify(property_log));
}

save_rating_setting = function () {
    for (i = 0; i < user_property.length; i++) {
        user_property[i].rating = $('#rating' + i).val();
    }
    property_log[account_index].property = user_property;
    $('#json_temp').val(JSON.stringify(property_log));
    averageRating_calculation();
}

averageRating_calculation = function () {
    for (i = 0; i < property_database.length; i++) {
        property_database[i].averageRating = 0;
        delete property_database[i].rating;
    }

    for (i = 0; i < property_log.length; i++) {
        for (j = 0; j < property_log[i].property.length; j++) {
            for (k = 0 ; k < property_database.length; k++) {
                if (property_database[k].id == property_log[i].property[j].id) {
                    property_database[k].averageRating = parseInt(property_database[k].averageRating, 10) + parseInt(property_log[i].property[j].rating, 10);
                    break;
                }
            }
        }
    }
    for (i = 0; i < property_database.length; i++) {
        n = parseInt(property_database[i].averageRating, 10) / property_log.length;
        property_database[i].averageRating = n.toFixed(2);
    }
    $('#temp_property').val(JSON.stringify(property_database));
}

//calling ethereum
//MainActivityInstance.updatePropertiesRating(i, importance, "update", { from: web3.eth.accounts[currentAccount], gas: 200000 });

/**
 * Модель объема жесткого диска
 * @type {Backbone.Model}
 */
var HDD_MODEL = Backbone.Model.extend({
  defaults : {
    name : "",
    size : 0
  }
});

/**
 * Коллекция объемов жестких дисков
 * @type {Backbone.Collection}
 */
var HDD_COLLECTION = Backbone.Collection.extend({
  model : HDD_MODEL
});

/**
 * Модель времени 
 * @type {Backbone.Model}
 */
var TIME_MODEL = Backbone.Model.extend({
  defaults : {
    name : "",
    minutes : 0
  }
});

/**
 * Коллекция времени
 * @type {Backbone.Collection}
 */
var TIME_COLLECTION = Backbone.Collection.extend({
  model : TIME_MODEL
});

/**
 * Модель скорости передачи
 * @type {Backbone.Model}
 */
var SPEED_MODEL = Backbone.Model.extend({
  defaults : {
    name : "",
    speed : 0
  }
});

/**
 * Коллекция скорости перпедачи
 * @type {Backbone.Collection}
 */
var SPEED_COLLECTION = Backbone.Collection.extend({
  model : SPEED_MODEL
});

/**
 * Результирующая модель. Содержит в себе даныне для калькуляции
 */
var RES_MODEL = Backbone.Model.extend({
  defaults : {
    size      : 0, // размер файла
    time      : 0, // время за которое необходимо передать
    speed     : 0, // скорость за которую необходимо передать
  },
  
  selected  : [], // Выделенные элементы


  /**
   * Определяем какой элемент кликнули и надо оставить в памяти только 2
   * предыдущий и который кликнули
   * @param {Object}
   */
  _set : function( obj_changed ){
    var key = Object.keys(obj_changed)[0];
    if( this.selected.length === 2 && key !== this.selected[1] ){
      var from_el = this.selected.splice(0,1);
      var key_del = from_el[0];
      this.set({ key_del : this.defaults[key_del] },{ silent : true})
      var collection = function(){
        switch( key_del ){
          case 'size' : return hdd_collection;
          case 'time' : return time_collection;
          case 'speed' : return speed_collection;
        }
      }()
      collection.where({ active : true }).map(function( item ){
        item.set({ active : false })
      })
    }
    if( key !== this.selected[1]  ){
      this.selected.push( key );
    }
    this.set( obj_changed );
  }
});



var res = new RES_MODEL;

var hdd_collection = new HDD_COLLECTION([
  {name : "700 Мб(CD диск)"                           , size : 700    },
  {name : "1400 Мб(фильм в обычном качестве)"         , size : 1400   },
  {name : "4700 Мб(фильм в хорошем качестве или DVD)" , size : 4700   },
  {name : "10 Гб(фильм в Full HD)"                    , size : 10240  },
  {name : "50 Гб(Blue-Ray диск)"                      , size : 51200  }
]);

var time_collection = new TIME_COLLECTION([
  {name : "10 минут"  , minutes : 30    },
  {name : "30 минут"  , minutes : 1400  },
  {name : "1 час"     , minutes : 60    },
  {name : "2 часа"    , minutes : 120   },
  {name : "3 часа"    , minutes : 180   },
  {name : "8 часа"    , minutes : 480   },
  {name : "24 часа"   , minutes : 1440  }
]);

var speed_collection = new SPEED_COLLECTION([
  {name : "0.1 Мбит/с"  , speed : 0.1   },
  {name : "1 Мбит/с"    , speed : 1     },
  {name : "2 Мбит/с"    , speed : 2     },
  {name : "5 Мбит/с"    , speed : 5     },
  {name : "10 Мбит/с"   , speed : 10    },
  {name : "20 Мбит/с"   , speed : 20    },
  {name : "50 Мбит/с"   , speed : 50    }
]);


var LIST_VIEW = Backbone.View.extend({

  template : "#li_tpl",

  model : res,

  initialize : function(){
    this.listenTo( this.collection , 'change' , this.render );
    this.render();
  },

  render : function(){
    var tpl_c = _.template( $(this.template).html() );
    $(this.$el).empty().append(
      tpl_c({
        els : this.collection.toArray()
      })
    )
  },


  /**
   * Выделение одного из элементов
   * @param  {Event} e 
   * @return {Backnode.Model}
   */
  _previos_active : function( e ){
    var cid = $(e.target).attr('id');
    var model = this.collection.get( cid );
    this.collection.where({ active : true }).map(function( item ){
      item.set({ active: false } , {silent : true});
    })
    model.set({ active : true });
    return model;
  }


});




var HDD_VIEW = LIST_VIEW.extend({

  el : "#hdd_container",


  initialize : function(){
    SPEED_VIEW.__super__.initialize.apply(this, arguments);
    this.listenTo( this.collection , 'unselect.hdd' , function(){
      console.log("undelegate hdd");
    })
  },

  collection : hdd_collection,

  events : {
    'click li' : function( e ){
      var model = this._previos_active( e );
      this.model._set({ size : model.get('size') })
    }
  }

});





var TIME_VIEW = LIST_VIEW.extend({

  el : "#time_container",

  initialize : function(){
    SPEED_VIEW.__super__.initialize.apply(this, arguments);
    this.listenTo( this.collection , 'unselect.time' , function(){
      console.log("undelegate time");
    })
  },


  collection : time_collection,


  events : {
    'click li' : function( e ){
      var model = this._previos_active( e );
      this.model._set({ time : model.get('minutes') })
    }
  }

});






var SPEED_VIEW = LIST_VIEW.extend({

  el : "#speed_container",

  initialize : function(){
    SPEED_VIEW.__super__.initialize.apply(this, arguments);
    this.listenTo( this.collection , 'unselect.speed' , function(){
      console.log("undelegate speed");
    })
  },

  collection : speed_collection,

  events : {
    'click li' : function( e ){
      var model = this._previos_active( e );
      this.model._set({ speed : model.get('speed') });
    }
  }

});



















var RES_VIEW = Backbone.View.extend({

  el : "#res",

  template : "#res_tpl",

  initialize : function(){
    this.listenTo( this.model , 'change' , this.render );
    this.render();
  },

  model : res,

  render : function(){
    var tpl_c = _.template( $(this.template).html() );

    $(this.$el).empty().append(
      tpl_c({
        model : this.model
      })
    )
  }

})





$(document).ready(function(){
  new HDD_VIEW();
  new TIME_VIEW();
  new SPEED_VIEW();
  new RES_VIEW();
});
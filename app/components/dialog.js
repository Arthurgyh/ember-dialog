import maxZIndex from "ember-dialog/utils/highest-zindex";

export default Ember.Component.extend({

    /**
      @property layoutName
      @type {String}
    */
    layoutName: 'components/dialog',

    /**
      Visibilities state of the dialog.

      @property isVisible
      @type Boolean
      @default false
    */
    isVisible: false,

    /**
      The dialog is active now.

      @property isActive
      @type Boolean
      @default false
    */
    isActive: function() {
        return this.get('name') === this.get('dialogManager.active');
    }.property('name', 'dialogManager.active'),

    /**
      Make dialog's z-index property biggest.

      @method _visibleDidChange
      @private
    */
    _visibleDidChange: function() {
        // Element not visible - do not recalculate z-index for it
        if (!this.get('isVisible')) {
          return;
        }

        // Element inserting now - we should asynchronize enlargement of
        // z-index css property. This method will not be executed while current
        // method will not be finished.
        Ember.run.later(this, function() {

            // Biggest z-index
            var zindex = maxZIndex(),

                // Component element (wrapper of dialog-element)
                // Dialog element
                dialog = this.$('.dialog-dialog');

            // Set z-index biggest then biggenest
            dialog.css({'z-index': zindex + 1});

            // Trying to search input element or button to focus it
            var firstInput = this.$('input:visible:first');
            if (firstInput.size()) {
                firstInput.focus();
            }

        }, 0);

    }.observes('isVisible'),

    /**
      Show dialog window.

      @method show
      @chainable
    */
    show: function() {
        return this.set('isVisible', true);
    },

    /**
      Hide dialog window.

      @method hide
      @chainable
    */
    hide: function() {
        this.set('isVisible', false);
    },

    /**
      Hide this dialog and mark as closed.

      @method close
      @return {Ember.RSVP.Promise}
    */
    close: function() {
        return this.get('dialogManager').close(this.get('name'));
    },

    /**
      Reject promise and close dialog.

      @method decline
      @chainable
    */
    decline: function() {
        Ember.Logger.log('✘ %cDecline action%c: ' + this.get('name'), 'font-weight: 900; color: #900;', null);
        if (this.has('rejected')) {
            var callback = this.get('rejected');
            this.get('rejected').call(this, this);
        }
        this.close();
        return this;
    },

    /**
      Resolve promise and close dialog.

      @method decline
      @chainable
    */
    accept: function() {
        Ember.Logger.log('✓ %cConfirm action%c ' + this.get('name'), 'font-weight: 900; color: #070;', null);
        if (this.has('resolved')) {
            var callback = this.get('resolved');
            this.get('resolved').call(this, this);
        }
        this.close();
        return this;
    },

    /**
      Handler for a key-down events. Close dialog on pressing escape.

      @method keyDown
    */
    keyDown: function(e) {
        // console.log(this.get('name'), this.get('dialogManager.active'), this.get('isActive'));
        if (e.keyCode === 27 && this.get('isActive')) {
            // Escape key
            this.decline();
            return false;
        }
    },

    /**
      Contains event handlers
      @attribute {Function} decline - Executed on click `close` button. Close promise as rejected.
      @attribute {Function} accept  - Executed on click `done` button. Close promise as resolved.
      @type Object
    */
    actions: {

        /**
          Occures when button type "close" clicked.
          @method decline
        */
        decline: function(dialog) {
          this.decline();
        },

        /**
          Occures when button type "done" clicked.
          @method decline
        */
        accept: function(dialog) {
          this.accept();
        }

    }

});
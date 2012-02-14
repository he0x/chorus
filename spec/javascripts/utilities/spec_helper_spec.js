describe("spec_helper", function() {
    describe("stubQtip", function() {
        beforeEach(function() {
            this.span = $("<span></span>");
            this.anchor = $("<a></a>");
            this.el = $("<div></div>").append(this.span).append(this.anchor);

            this.anchorQtip = stubQtip("a");
            this.spanQtip = stubQtip("span");
        });

        it("returns a different fake qtip element for every unique selector", function() {
            expect(this.anchorQtip).toBeA(jQuery);
            expect(this.spanQtip).toBeA(jQuery);

            expect(this.anchorQtip).not.toBe(this.spanQtip);
        });

        describe("when qtip is called on one of the stubbed selectors", function() {
            beforeEach(function() {
                this.el.find("a").qtip({ content: "<li>fake</li>" });
            });

            it("only affects the fake qtip element for that selector", function() {
                this.el.find('a').mouseenter();
                expect(this.anchorQtip.find("li")).toHaveText("fake");

                this.el.find('span').mouseenter();
                expect(this.spanQtip).not.toContain("li");
            });
        });
    });

    describe("#toBeA", function() {
        context("when passed a string", function() {
            it("does a 'typeof' check", function() {
                expect(1).toBeA("number");
                expect(1).not.toBeA("string");
                expect("hello").toBeA("string");
                expect("hello").not.toBeA("number");
            });
        });

        context("when passed a function", function() {
            it("does an 'instanceof' check", function() {
                expect(fixtures.user()).toBeA(chorus.models.User);
                expect(fixtures.user()).not.toBeA(chorus.models.BoxplotTask);
            });
        });
    });

    describe("#toMatchUrl", function() {
        context("when *no* 'paramsToIgnore' option is passed", function() {
            it("compares the urls, including all query parameters", function() {
                expect("/foo?bar=1&baz=2").not.toMatchUrl("/foo?baz=2");

                expect("/foo?bar=1&baz=2").toMatchUrl("/foo?baz=2&bar=1");
            });
        });

        context("when a 'paramsToIgnore' option is passed", function() {
            it("compares the urls, disregarding the given query parameters", function() {
                expect("/foo?bar=1&baz=2&quux=3").not.toMatchUrl("/foo?baz=2", {
                    paramsToIgnore: ["quux"]
                });
                expect("/foo?baz=2").not.toMatchUrl("/foo?bar=1&baz=2&quux=3", {
                    paramsToIgnore: ["quux"]
                });

                expect("/foo?bar=1&baz=2&quux=3").toMatchUrl("/foo?baz=2", {
                    paramsToIgnore: ["bar", "quux"]
                });
                expect("/foo?baz=2").toMatchUrl("/foo?bar=1&baz=2&quux=3", {
                    paramsToIgnore: ["bar", "quux"]
                });
            });
        });
    });

    describe("#toHaveBeenCalledOn", function() {
        beforeEach(function() {
            this.model1 = fixtures.user()
            this.model2 = fixtures.user()
            spyOn(chorus.models.User.prototype, 'fetch')
            spyOn(chorus.models.User.prototype, 'save')
        });

        it("passes if the given spy was ever called on the given object", function() {
            this.model1.fetch()
            this.model2.fetch()
            expect(chorus.models.User.prototype.fetch).toHaveBeenCalledOn(this.model1)
            this.model2.save()
            expect(chorus.models.User.prototype.save).not.toHaveBeenCalledOn(this.model1)
        });
    });
});

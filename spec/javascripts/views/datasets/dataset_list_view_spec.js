describe("chorus.views.DatasetList", function() {
    beforeEach(function() {
        this.collection = new chorus.collections.DatasetSet([
            fixtures.datasetChorusView(),
            fixtures.datasetSandboxTable(),
            fixtures.datasetSourceTable({recentComment: null, hasCredentials: false})
        ]);
        this.collection.loaded = true;
        this.view = new chorus.views.DatasetList({collection: this.collection});
    })

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
            this.instance = this.collection.models[0].get('instance')
        });

        it("renders an item for each dataset", function() {
            expect(this.view.$("> li").length).toBe(this.collection.length);
        });

        it("renders items without credentials with a no_credentials class", function() {
            expect(this.view.$('li.no_credentials').length).toBe(1);
        })

        it("links the datasets to their show page", function() {
            _.each(this.collection.models, function(dataset, index) {
                if (dataset.get('hasCredentials') !== false) {
                    expect(this.view.$("li:eq(" + index + ") a.name")).toHaveAttr("href", this.collection.at(index).showUrl())
                }
            }, this);
        })

        it("datasets without credentials should not have links", function() {
            expect(this.view.$('li.no_credentials a').not(".found_in a")).not.toExist();
        })

        it("displays the datasets' names", function() {
            for (var i = 0; i < this.collection.length; i++) {
                expect(this.view.$(".name").eq(i).text().trim()).toBe(this.collection.models[i].get("objectName"));
            }
        })

        it("links the small instance breadcrumb to the BrowseDatasetDialog, set to instance", function() {
            expect(this.view.$(".location a:eq(0)")).toHaveClass("dialog")
            expect(this.view.$(".location a:eq(0)").attr("data-dialog")).toBe("BrowseDatasets")
            expect(this.view.$(".location a:eq(0)").data("instance")).toEqual(this.instance);
        })

        it("links the small database breadcrumb to the BrowseDatasetDialog, set to database", function() {
            expect(this.view.$(".location a:eq(1)")).toHaveClass("dialog")
            expect(this.view.$(".location a:eq(1)").attr("data-dialog")).toBe("BrowseDatasets")
            expect(this.view.$(".location a:eq(1)").data("instance")).toEqual(this.instance);
            expect(this.view.$(".location a:eq(1)").data("databaseName")).toEqual(
                this.collection.models[0].get('databaseName'));
        })

        it("links the small schema breadcrumb to the show URL of the schema", function() {
            expect(this.view.$(".location a:eq(2)").attr('href')).toBe(this.collection.models[0].schema().showUrl())
        })

        it("displays an icon for each dataset", function() {
            expect(this.view.$("li img").length).toBe(3);
            for (var i = 0; i < this.collection.length; i++) {
                var model = this.collection.models[i];
                expect(this.view.$("li img").eq(i).attr("src")).toBe(model.iconUrl());
            }
        });

        it("does not create comment markup when there's no comment exist", function() {
            expect(this.view.$("li:eq(2) .comment")).not.toExist();
        });

        it("creates comment markup when there's no comment exist", function() {
            expect(this.view.$("li:eq(0) .comment")).toExist();
        });

        it("does not render the disabled names", function() {
            expect(this.view.$(".name_disabled")).not.toExist();
        });

        it("displays the location of the dataset", function() {
            for (var i = 0; i < this.collection.length; i++) {
                var model = this.collection.models[i];
                if (model.get('hasCredentials') === false) {
                    expect(this.view.$("li .location").eq(i)).toContainText(
                        model.get("instance").name + '.' + model.get("databaseName") + '.' + model.get("schemaName"));
                } else {
                    expect(this.view.$("li .location").eq(i).find("a").eq(0).text()).toBe(model.get("instance").name);
                    expect(this.view.$("li .location").eq(i).find("a").eq(1).text()).toBe(model.get("databaseName"));
                    expect(this.view.$("li .location").eq(i).find("a").eq(2).text()).toBe(model.get("schemaName"));
                }
            }
        })

        context("when no item was previously selected", function() {
            it("pre-selects the first item", function() {
                expect(this.view.$("li").eq(0)).toHaveClass("selected");
            });
        });

        context("when an item was previously selected", function() {
            beforeEach(function() {
                this.view.$("li:eq(1)").click();
                this.view.render();
            })

            it("restores that item selection", function() {
                expect(this.view.$("li").eq(0)).not.toHaveClass("selected");
                expect(this.view.$("li").eq(1)).toHaveClass("selected");
            })
        })

        describe("clicking an li", function() {
            beforeEach(function() {
                spyOn(chorus.PageEvents, "broadcast").andCallThrough();
                this.view.$("li").eq(1).click();
            });

            it("selects only that item", function() {
                expect(this.view.$("li.selected").length).toBe(1);
                expect(this.view.$("li").eq(1)).toHaveClass("selected");
            });

            it("broadcasts dataset:selected with an argument of the selected dataset", function() {
                expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("dataset:selected", this.collection.models[1]);
            });
        });
    });
});

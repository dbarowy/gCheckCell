define(["DataDebugMethods/InputSample"], function (InputSample) {
    describe("Full InputSample test", function () {
        var sample;
        beforeEach(function () {
            sample = new InputSample(3, 1);
        });
        it("add test", function () {
            sample.add(1);
            sample.add(2);
            sample.add(3);
            expect(sample.input_array).toEqual([
                [1],
                [2],
                [3]
            ]);
            //exceeding maximum size
            expect(function () {
                sample.add(4);
            }).toThrow();
            //cannot add array after adding datum
            expect(function () {
                sample.addArray([]);
            }).toThrow();
        });
        it("addArray test", function () {
            sample.addArray([
                [1],
                [2],
                [3]
            ]);
            expect(sample.input_array).toEqual([
                [1],
                [2],
                [3]
            ]);
            //cannot add number after adding array
            expect(function () {
                sample.add(4);
                sample.add(5);
            }).toThrow();
            expect(function () {
                sample.addArray([]);
            }).toThrow();
        });
        it("oneDtoTwoD test", function () {
            var san = new InputSample(2, 2);
            expect(sample.oneDtoTwoD(0)).toEqual({col: 0, row: 0});
            expect(sample.oneDtoTwoD(3)).toEqual({col: 0, row: 3});
            expect(sample.oneDtoTwoD(5)).toEqual({col: 0, row: 5});
            expect(san.oneDtoTwoD(0)).toEqual({col: 0, row: 0});
            expect(san.oneDtoTwoD(3)).toEqual({col: 1, row: 1});
            expect(san.oneDtoTwoD(5)).toEqual({col: 1, row: 2});

        });
        it("getInput test", function () {
            sample.add(1);
            sample.add(2);
            sample.add(3);
            expect(sample.getInput(0)).toEqual(1);
            expect(sample.getInput(1)).toEqual(2);
            expect(sample.getInput(2)).toEqual(3);

        });
        it("getHashCode test", function () {
            expect(sample.getHashCode()).toEqual([].toString());
            sample.setIncludes([1]);
            expect(sample.getHashCode()).toEqual([1].toString());
        });
        it("setIncludes test", function () {
            sample.setIncludes([1,0,2]);
            expect(sample.includes).toEqual([1,0,2]);
            expect(sample.excludes).toEqual({"1":1});

        });
        it("toString test", function () {
            sample.add(1);
            sample.add(2);
            sample.add(3);
            expect(sample.toString()).toEqual([[1],[2],[3]].toString());
        });
    });
});
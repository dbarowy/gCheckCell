/**
 * This object provide a global access point to Application services.
 * It is designed to be a scaled down equivalent of the SpreadsheetApp object in Google Spreadsheets
 * and Excel.Application in Microsoft Office.
 * @type {{_GDocs: boolean, getWorksheets: Function, getActiveWorkbook: Function}}
 */

define("XClasses/XApplication", ["XClasses/XWorkbook", "XClasses/XWorksheet"], function (XWorkbook, XWorksheet) {
    "use strict";
    if (typeof SpreadsheetApp !== "undefined") {
        return{

            _workbooks:{},
            /**
             * Get the spreadsheets in the active workbook
             * @returns {Array} an array of XSpreadsheet objects.
             */
            getWorksheets: function () {
                var spread, xspread, res = [], i, len, sheets;
                if ((spread = SpreadsheetApp.getActiveSpreadsheet()) !== null) {
                    xspread = new XWorkbook(spread, this);
                    sheets = spread.getSheets();
                    for (i = 0, len = sheets.length; i < len; i++) {
                        res.push(new XWorksheet(sheets[i], xspread));
                    }
                    return res;
                }
                else {
                    throw new Error("Fatal error retrieving the active spreadsheet.");
                }
            },
            /**
             * Return the active workbook.
             * @returns {XWorkbook}
             */
            getActiveWorkbook: function () {
                return new XWorkbook(SpreadsheetApp.getActiveSpreadsheet(), this);
            },
            getWorkbookByName: function (name) {
                var book;
                if(!(book=this._workbooks[name])){
                    book = this._workbooks[name] = new XWorkbook(SpreadsheetApp.getActiveSpreadsheet(), this);
                }
                return book;
            }

        };
    } else {
       // throw new Error("Office implementation inexistent.");
        return{

            /**
             * Get the spreadsheets in the active workbook
             * @returns {Array} an array of XSpreadsheet objects.
             */
            getWorksheets: function () {
                var res=[], xspread;
                var values = [["","Inclass","","","","","","","","","","","","","","","","","Homework","","","","","","","","","","","","","","","","","","","","","","","","","","",""],["ID",1,2,3,4,5,6,7,8,9,10,11,"11 ext",12,13,14,15,16,1,2,3,4,5,6,7,8,9,10,"Q1","MT1","MT2","MT 3","MT3 EC","TOT MT3","Tot MT","ADJ MT","IC Pts","IC %","HW Pts","HW %","X Cred","Partners","Tot. PTS","% MAX","ADJ PTS","% MAX"],[2305,9,7,9,9,9.5,10,10,10,6,7,"",10,8,10,5,5,5,7,4.5,6.5,10,7,13,12,4,"",9,3,88,88,78,13,91,89,89.5,129.5,83.54838709677419,76,83.97790055248619,6,8,95.25438127487672,96.90418368528935,95.58771460821006,94.57082402727167],[5813,9,7,9,9,10,10,"",10,6,"","","",8,"","","",5,3,6,7,11,"","","","","",8,"",84,62,0,"",0,48.666666666666664,73,83,53.54838709677419,35,38.67403314917127,0,7,54.81484781876869,55.76423898427152,71.03707004099091,70.28135652991655],[5407,8,5,8,9,10,"",10,10,9,9,5,9,7,"",10,"",5,7,3.5,4.5,10,6,14,11,3,"",0,3,72,48,66,"",66,62,69,114,73.54838709677419,62,68.50828729281768,6,9,74.00944573159865,75.29128663305752,78.6761123982653,77.83913247913483],[5127,7,7,9.5,9,7,"",10,10,9,7,"","","","","","",5,"","",6.5,"",4,"",0,"","",3,3,94,94,60,16,60,82.66666666666667,94,80.5,51.935483870967744,16.5,34.232044198895025,6,7,76.47236578942157,77.79686437647628,84.02792134497713,83.13400728811568],[4231,8,5,9,9,9,10,10,10,9,"","","",8,10,10,"","",7,8,8,12,9,"",12,5,5,7,"",88,68,52,18,70,75.33333333333333,79,107,69.03225806451613,73,80.66298342541437,6,12,87.17142913721062,88.68123511132822,89.61587358165508,88.66251322440344],[7377,10,"","","","","","",10,9,"",9,10,"","","","","","","","","",8,12,0,"","","",3,0,48,42,13,55,34.333333333333336,51.5,48,30.967741935483872,23,25.41436464088398,0,5,37.28590665161686,37.93169719526383,48.730351096061305,48.211943105677676],["0632",7,9.5,8,8,10,10,10,10,9,5,10,"",8,10,10,5,5,7,6,8,11.5,10,14,"",4,5,5,3,92,94,70,"",70,85.33333333333333,93,134.5,86.7741935483871,73.5,81.21546961325967,6,10,94.88716608249668,96.53060833916709,99.99827719360779,98.93446573410134],[3770,6,9.5,9,7,10,10,10,10,10,9,10,10,8,10,10,5,5,4,4,6,9,9,4,9,4,8,"",1,50,44,56,6,62,52,56,148.5,95.80645161290323,58,64.08839779005525,"",10,71.3158082338264,72.55099543204217,73.98247490049309,73.1954272951687],[4674,7,9,9,7,10,10,10,10,9,9,9,9,9,10,"","",5,3,6.5,6.5,11.5,9,15,8,5,"","",3,74,48,72,9,81,67.66666666666667,77.5,132,85.16129032258064,67.5,74.58563535911603,0,11,82.73559872472723,84.16857627784465,89.29115428028278,88.34124838368403],[7567,8,7,8,9,7,10,10,10,9,"",10,10,8,"","","",5,"",5,3.5,7.5,10,12,3,"","",1,2,74,69,32,"",32,58.333333333333336,71.5,111,71.61290322580645,44,48.61878453038674,0,10,68.92750351492109,70.12132536249037,77.70528129269887,76.87862936405314],["0822",8,7,5.5,8,10,10,10,10,"","",5,5,"","","","","","",6,8,10.5,10,"","","","",3,"",88,81,77,"",77,82,84.5,78.5,50.645161290322584,37.5,41.43646408839779,6,10,80.01360422978672,81.39943693750409,81.6802708964534,80.81133184436348],["0071",5,8.5,5.5,9,10,10,10,10,9,"","",5,6,"","",5,5,3,6,7,9.5,10,"","","","","",3,87,72,78,"",78,79,82.5,98,63.225806451612904,38.5,42.5414364640884,6,8,78.29454048595022,79.6505990723067,80.62787381928355,79.77013048078054],[1579,10,9,7.5,8,9,10,"",10,9,10,"",10,"","",10,5,5,6,6,7.5,12,10,15,"","","","",3,84,74,94,"",94,84,89,112.5,72.58064516129032,59.5,65.74585635359117,6,8,87.05441691914692,88.56219624591428,90.38775025248025,89.42617844128365],[3034,10,8.5,9.5,9,10,10,10,10,10,9,10,10,9,10,10,5,5,6,3.5,7,10.5,10,15,7,4,5,9,3,80,64,91,"",91,78.33333333333333,85.5,155,100,80,88.39779005524862,6,9,92.62185389809699,94.22606103033387,97.39963167587477,96.36346538145058],[6719,7,9.5,7.5,8,10,10,10,10,8,"",5,10,9,10,10,5,5,6,8.5,8,12,10,15,12,"",8,8,3,88,76,72,17,89,84.33333333333333,88.5,134,86.45161290322581,90.5,100,0,11,98.29749103942652,100,101.07526881720429,100],[4847,10,9.5,9,9,9.5,10,10,10,9,7,9,10,9,10,10,5,"",6,6,7,9.5,8,14,5,5,5,7,2,81,48,55,10,65,64.66666666666667,73,146,94.19354838709677,74.5,82.32044198895028,6,12,84.53010950711895,85.99416792155401,90.08566506267451,89.1273069237099],[1815,"","",9,9,9.5,10,10,10,9,7,9,10,8,10,10,5,5,"",6.5,8,11,9,14,1,4,"",8,2,74,59,62,12,74,69,74,149.14285714285714,96.22119815668202,63.5,70.1657458563536,6,7,80.73115733550594,82.12941803685017,84.06449066883927,83.17018757661758],[9685,8,6,9,8,10,10,10,10,"",7,"",5,7,"",10,"",5,5,5,2,6,"","",2,"","","",3,80,64,83,1,84,76,82,105,67.74193548387096,23,25.41436464088398,6,11,77.19271668745915,78.52969172580165,81.19271668745915,80.32896438227343],[9933,6,6,8,8,10,10,10,10,9,7,10,10,8,10,10,5,5,4,5,6.5,1.5,10,3,10,4,8,3,"",66,38,53,7,60,54.666666666666664,63,142,91.61290322580645,55,60.773480662983424,6,8,69.8421750925761,71.05183901851862,75.39773064813166,74.59562713059836],["","","",9,9,9.5,10,10,10,8,7,10,10,6,10,10,5,"","",8,7.5,9,9,14,"","","",7,3,88,58,52,"",52,66,73,141.14285714285714,91.05990783410138,57.5,63.53591160220995,6,9,78.7659699060519,80.13019363277476,83.43263657271855,82.54505533258326],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],["",7.882352941176471,7.6875,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",155,"",90.5,"","","",98.29749103942652,"",101.07526881720429,""],["",8,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],["","Notes:  TOT PTS:  6*Midterm average+.1.5*IC % + 1.5 HW % + #Partners","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],["","","IC % is the % of Maximum number of inclass points of anyone","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],["","","HW % is the % of maximum number of points of homework of anyone.","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],["","","ADJ PTS:  6*Midterm average of the highest two midterms + 1.4 ic % + 1.4 HW % + # Partners","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""]];
                var formulas = [["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF3+AG3","\u003dAVERAGE(AD3:AE3,AH3)","\u003d(AD3+AE3+AH3-MIN(AD3,AE3,AH3))/2","\u003dB3+C3+D3+E3+F3+G3+H3+I3+J3+K3+L3+M3+N3+O3+P3+Q3+R3","\u003d+AK3*100/$AK$24","\u003d+S3+T3+U3+V3+W3+X3+Y3+Z3+AA3+AB3+AC3","\u003d+AM3/$AM$24*100","","","\u003d+(6*AI3+1.5*(AL3+AN3))/9+AP3","\u003d+AQ3/AQ$24*100","\u003d+(6*AJ3+1.5*(AL3+AN3))/9+AP3","\u003d+AS3/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF4+AG4","\u003dAVERAGE(AD4:AE4,AH4)","\u003d(AD4+AE4+AH4-MIN(AD4,AE4,AH4))/2","\u003dB4+C4+D4+E4+F4+G4+H4+I4+J4+K4+L4+M4+N4+O4+P4+Q4+R4","\u003d+AK4*100/$AK$24","\u003d+S4+T4+U4+V4+W4+X4+Y4+Z4+AA4+AB4+AC4","\u003d+AM4/$AM$24*100","","","\u003d+(6*AI4+1.5*(AL4+AN4))/9+AP4","\u003d+AQ4/AQ$24*100","\u003d+(6*AJ4+1.5*(AL4+AN4))/9+AP4","\u003d+AS4/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF5+AG5","\u003dAVERAGE(AD5:AE5,AH5)","\u003d(AD5+AE5+AH5-MIN(AD5,AE5,AH5))/2","\u003dB5+C5+D5+E5+F5+G5+H5+I5+J5+K5+L5+M5+N5+O5+P5+Q5+R5","\u003d+AK5*100/$AK$24","\u003d+S5+T5+U5+V5+W5+X5+Y5+Z5+AA5+AB5+AC5","\u003d+AM5/$AM$24*100","","","\u003d+(6*AI5+1.5*(AL5+AN5))/9+AP5","\u003d+AQ5/AQ$24*100","\u003d+(6*AJ5+1.5*(AL5+AN5))/9+AP5","\u003d+AS5/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF6","\u003dAVERAGE(AD6:AE6,AH6)","\u003d(AD6+AE6+AH6-MIN(AD6,AE6,AH6))/2","\u003dB6+C6+D6+E6+F6+G6+H6+I6+J6+K6+L6+M6+N6+O6+P6+Q6+R6","\u003d+AK6*100/$AK$24","\u003d+S6+T6+U6+V6+W6+X6+Y6+Z6+AA6+AB6+AC6","\u003d+AM6/$AM$24*100+AG6","","","\u003d+(6*AI6+1.5*(AL6+AN6))/9+AP6","\u003d+AQ6/AQ$24*100","\u003d+(6*AJ6+1.5*(AL6+AN6))/9+AP6","\u003d+AS6/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF7+AG7","\u003dAVERAGE(AD7:AE7,AH7)","\u003d(AD7+AE7+AH7-MIN(AD7,AE7,AH7))/2","\u003dB7+C7+D7+E7+F7+G7+H7+I7+J7+K7+L7+M7+N7+O7+P7+Q7+R7","\u003d+AK7*100/$AK$24","\u003d+S7+T7+U7+V7+W7+X7+Y7+Z7+AA7+AB7+AC7","\u003d+AM7/$AM$24*100","","","\u003d+(6*AI7+1.5*(AL7+AN7))/9+AP7","\u003d+AQ7/AQ$24*100","\u003d+(6*AJ7+1.5*(AL7+AN7))/9+AP7","\u003d+AS7/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF8+AG8","\u003dAVERAGE(AD8:AE8,AH8)","\u003d(AD8+AE8+AH8-MIN(AD8,AE8,AH8))/2","\u003dB8+C8+D8+E8+F8+G8+H8+I8+J8+K8+L8+M8+N8+O8+P8+Q8+R8","\u003d+AK8*100/$AK$24","\u003d+S8+T8+U8+V8+W8+X8+Y8+Z8+AA8+AB8+AC8","\u003d+AM8/$AM$24*100","","","\u003d+(6*AI8+1.5*(AL8+AN8))/9+AP8","\u003d+AQ8/AQ$24*100","\u003d+(6*AJ8+1.5*(AL8+AN8))/9+AP8","\u003d+AS8/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF9+AG9","\u003dAVERAGE(AD9:AE9,AH9)","\u003d(AD9+AE9+AH9-MIN(AD9,AE9,AH9))/2","\u003dB9+C9+D9+E9+F9+G9+H9+I9+J9+K9+L9+M9+N9+O9+P9+Q9+R9","\u003d+AK9*100/$AK$24","\u003d+S9+T9+U9+V9+W9+X9+Y9+Z9+AA9+AB9+AC9","\u003d+AM9/$AM$24*100","","","\u003d+(6*AI9+1.5*(AL9+AN9))/9+AP9","\u003d+AQ9/AQ$24*100","\u003d+(6*AJ9+1.5*(AL9+AN9))/9+AP9","\u003d+AS9/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF10+AG10","\u003dAVERAGE(AD10:AE10,AH10)","\u003d(AD10+AE10+AH10-MIN(AD10,AE10,AH10))/2","\u003dB10+C10+D10+E10+F10+G10+H10+I10+J10+K10+L10+M10+N10+O10+P10+Q10+R10","\u003d+AK10*100/$AK$24","\u003d+S10+T10+U10+V10+W10+X10+Y10+Z10+AA10+AB10+AC10","\u003d+AM10/$AM$24*100","","","\u003d+(6*AI10+1.5*(AL10+AN10))/9+AP10","\u003d+AQ10/AQ$24*100","\u003d+(6*AJ10+1.5*(AL10+AN10))/9+AP10","\u003d+AS10/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF11+AG11","\u003dAVERAGE(AD11:AE11,AH11)","\u003d(AD11+AE11+AH11-MIN(AD11,AE11,AH11))/2","\u003dB11+C11+D11+E11+F11+G11+H11+I11+J11+K11+L11+M11+N11+O11+P11+Q11+R11","\u003d+AK11*100/$AK$24","\u003d+S11+T11+U11+V11+W11+X11+Y11+Z11+AA11+AB11+AC11","\u003d+AM11/$AM$24*100","","","\u003d+(6*AI11+1.5*(AL11+AN11))/9+AP11","\u003d+AQ11/AQ$24*100","\u003d+(6*AJ11+1.5*(AL11+AN11))/9+AP11","\u003d+AS11/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF12+AG12","\u003dAVERAGE(AD12:AE12,AH12)","\u003d(AD12+AE12+AH12-MIN(AD12,AE12,AH12))/2","\u003dB12+C12+D12+E12+F12+G12+H12+I12+J12+K12+L12+M12+N12+O12+P12+Q12+R12","\u003d+AK12*100/$AK$24","\u003d+S12+T12+U12+V12+W12+X12+Y12+Z12+AA12+AB12+AC12","\u003d+AM12/$AM$24*100","","","\u003d+(6*AI12+1.5*(AL12+AN12))/9+AP12","\u003d+AQ12/AQ$24*100","\u003d+(6*AJ12+1.5*(AL12+AN12))/9+AP12","\u003d+AS12/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF13+AG13","\u003dAVERAGE(AD13:AE13,AH13)","\u003d(AD13+AE13+AH13-MIN(AD13,AE13,AH13))/2","\u003dB13+C13+D13+E13+F13+G13+H13+I13+J13+K13+L13+M13+N13+O13+P13+Q13+R13","\u003d+AK13*100/$AK$24","\u003d+S13+T13+U13+V13+W13+X13+Y13+Z13+AA13+AB13+AC13","\u003d+AM13/$AM$24*100","","","\u003d+(6*AI13+1.5*(AL13+AN13))/9+AP13","\u003d+AQ13/AQ$24*100","\u003d+(6*AJ13+1.5*(AL13+AN13))/9+AP13","\u003d+AS13/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF14+AG14","\u003dAVERAGE(AD14:AE14,AH14)","\u003d(AD14+AE14+AH14-MIN(AD14,AE14,AH14))/2","\u003dB14+C14+D14+E14+F14+G14+H14+I14+J14+K14+L14+M14+N14+O14+P14+Q14+R14","\u003d+AK14*100/$AK$24","\u003d+S14+T14+U14+V14+W14+X14+Y14+Z14+AA14+AB14+AC14","\u003d+AM14/$AM$24*100","","","\u003d+(6*AI14+1.5*(AL14+AN14))/9+AP14","\u003d+AQ14/AQ$24*100","\u003d+(6*AJ14+1.5*(AL14+AN14))/9+AP14","\u003d+AS14/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF15+AG15","\u003dAVERAGE(AD15:AE15,AH15)","\u003d(AD15+AE15+AH15-MIN(AD15,AE15,AH15))/2","\u003dB15+C15+D15+E15+F15+G15+H15+I15+J15+K15+L15+M15+N15+O15+P15+Q15+R15","\u003d+AK15*100/$AK$24","\u003d+S15+T15+U15+V15+W15+X15+Y15+Z15+AA15+AB15+AC15","\u003d+AM15/$AM$24*100","","","\u003d+(6*AI15+1.5*(AL15+AN15))/9+AP15","\u003d+AQ15/AQ$24*100","\u003d+(6*AJ15+1.5*(AL15+AN15))/9+AP15","\u003d+AS15/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF16+AG16","\u003dAVERAGE(AD16:AE16,AH16)","\u003d(AD16+AE16+AH16-MIN(AD16,AE16,AH16))/2","\u003dB16+C16+D16+E16+F16+G16+H16+I16+J16+K16+L16+M16+N16+O16+P16+Q16+R16","\u003d+AK16*100/$AK$24","\u003d+S16+T16+U16+V16+W16+X16+Y16+Z16+AA16+AB16+AC16","\u003d+AM16/$AM$24*100","","","\u003d+(6*AI16+1.5*(AL16+AN16))/9+AP16","\u003d+AQ16/AQ$24*100","\u003d+(6*AJ16+1.5*(AL16+AN16))/9+AP16","\u003d+AS16/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF17+AG17","\u003dAVERAGE(AD17:AE17,AH17)","\u003d(AD17+AE17+AH17-MIN(AD17,AE17,AH17))/2","\u003dB17+C17+D17+E17+F17+G17+H17+I17+J17+K17+L17+M17+N17+O17+P17+Q17+R17","\u003d+AK17*100/$AK$24","\u003d+S17+T17+U17+V17+W17+X17+Y17+Z17+AA17+AB17+AC17","\u003d+AM17/$AM$24*100","","","\u003d+(6*AI17+1.5*(AL17+AN17))/9+AP17","\u003d+AQ17/AQ$24*100","\u003d+(6*AJ17+1.5*(AL17+AN17))/9+AP17","\u003d+AS17/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF18+AG18","\u003dAVERAGE(AD18:AE18,AH18)","\u003d(AD18+AE18+AH18-MIN(AD18,AE18,AH18))/2","\u003dB18+C18+D18+E18+F18+G18+H18+I18+J18+K18+L18+M18+N18+O18+P18+Q18+R18","\u003d+AK18*100/$AK$24","\u003d+S18+T18+U18+V18+W18+X18+Y18+Z18+AA18+AB18+AC18","\u003d+AM18/$AM$24*100","","","\u003d+(6*AI18+1.5*(AL18+AN18))/9+AP18","\u003d+AQ18/AQ$24*100","\u003d+(6*AJ18+1.5*(AL18+AN18))/9+AP18","\u003d+AS18/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF19+AG19","\u003dAVERAGE(AD19:AE19,AH19)","\u003d(AD19+AE19+AH19-MIN(AD19,AE19,AH19))/2","\u003d(B19+C19+D19+E19+F19+G19+H19+I19+J19+K19+L19+M19+N19+O19+P19+Q19+R19)*16/14","\u003d+AK19*100/$AK$24","\u003d+S19+T19+U19+V19+W19+X19+Y19+Z19+AA19+AB19+AC19","\u003d+AM19/$AM$24*100","","","\u003d+(6*AI19+1.5*(AL19+AN19))/9+AP19","\u003d+AQ19/AQ$24*100","\u003d+(6*AJ19+1.5*(AL19+AN19))/9+AP19","\u003d+AS19/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF20+AG20","\u003dAVERAGE(AD20:AE20,AH20)","\u003d(AD20+AE20+AH20-MIN(AD20,AE20,AH20))/2","\u003dB20+C20+D20+E20+F20+G20+H20+I20+J20+K20+L20+M20+N20+O20+P20+Q20+R20","\u003d+AK20*100/$AK$24","\u003d+S20+T20+U20+V20+W20+X20+Y20+Z20+AA20+AB20+AC20","\u003d+AM20/$AM$24*100","","","\u003d+(6*AI20+1.5*(AL20+AN20))/9+AP20","\u003d+AQ20/AQ$24*100","\u003d+(6*AJ20+1.5*(AL20+AN20))/9+AP20","\u003d+AS20/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF21+AG21","\u003dAVERAGE(AD21:AE21,AH21)","\u003d(AD21+AE21+AH21-MIN(AD21,AE21,AH21))/2","\u003dB21+C21+D21+E21+F21+G21+H21+I21+J21+K21+L21+M21+N21+O21+P21+Q21+R21","\u003d+AK21*100/$AK$24","\u003d+S21+T21+U21+V21+W21+X21+Y21+Z21+AA21+AB21+AC21","\u003d+AM21/$AM$24*100","","","\u003d+(6*AI21+1.5*(AL21+AN21))/9+AP21","\u003d+AQ21/AQ$24*100","\u003d+(6*AJ21+1.5*(AL21+AN21))/9+AP21","\u003d+AS21/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003d+AF22+AG22","\u003dAVERAGE(AD22:AE22,AH22)","\u003d(AD22+AE22+AH22-MIN(AD22,AE22,AH22))/2","\u003d(B22+C22+D22+E22+F22+G22+H22+I22+J22+K22+L22+M22+N22+O22+P22+Q22+R22)*16/14","\u003d+AK22*100/$AK$24","\u003d+S22+T22+U22+V22+W22+X22+Y22+Z22+AA22+AB22+AC22","\u003d+AM22/$AM$24*100","","","\u003d+(6*AI22+1.5*(AL22+AN22))/9+AP22","\u003d+AQ22/AQ$24*100","\u003d+(6*AJ22+1.5*(AL22+AN22))/9+AP22","\u003d+AS22/$AS$24*100"],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],["","\u003dAVERAGE(B4:B21)","\u003dAVERAGE(C4:C21)","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\u003dMAX(AK4:AK22)","","\u003dMAX(AM3:AM22)","","","","\u003dMAX(AQ3:AQ22)","","\u003dMAX(AS3:AS22)",""],["","\u003dMEDIAN(B4:B24)","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""]];
                xspread = new XWorkbook({Name:"grades"}, this);
                res.push(new XWorksheet({Name:"Grades", _values:values, _formulas:formulas, _lastRow:29, _lastColumn:46}, xspread));
                return res;
            },
            /**
             * Return the active workbook.
             * @returns {XWorkbook}
             */
            getActiveWorkbook: function () {
                return new XWorkbook({Name:"grades"}, this);
            },
            getWorkbookByName: function (name) {
                return new XWorkbook({Name:"grades"}, this);
            }

        };
    }

});
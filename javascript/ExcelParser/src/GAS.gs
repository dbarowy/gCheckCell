<?!= include('require'); ?>
<?!= include('jstat'); ?>
<?!= include('lodash'); ?>
<?!= include('moment'); ?>
<?!= include('numeral'); ?>
<?!= include('underscore_string'); ?>
<?!= include('numeric'); ?>
<?!= include('formula'); ?>

<?!= include('Address'); ?>
<?!= include('BinOpExpr'); ?>
<?!= include('ConstantArray'); ?>
<?!= include('ConstantError'); ?>
<?!= include('ConstantLogical'); ?>
<?!= include('ConstantNumber'); ?>
<?!= include('ConstantString'); ?>
<?!= include('ParensExpr'); ?>
<?!= include('PostfixOpExpr'); ?>
<?!= include('ReferenceAddress'); ?>
<?!= include('PEG'); ?>
<?!= include('PEGParser'); ?>
<?!= include('FSharp'); ?>
<?!= include('HashMap'); ?>
<?!= include('Profiler'); ?>
<?!= include('XLogger'); ?>
<?!= include('ReferenceExpr'); ?>
<?!= include('ReferenceNamed'); ?>
<?!= include('UnaryOpExpr'); ?>
<?!= include('Range'); ?>
<?!= include('Reference'); ?>
<?!= include('ReferenceRange'); ?>
<?!= include('ReferenceFunction'); ?>
<?!= include('AST'); ?>
<?!= include('Parser'); ?>
<?!= include('ParserUtility'); ?>
<?!= include('XApplication'); ?>
<?!= include('XRange'); ?>
<?!= include('XWorkbook'); ?>
<?!= include('XWorksheet'); ?>

<script>
  function onSuccess(data) {
  require(["XClasses/XApplication", "Parser/AST/AST"], function(XApplication, AST){
  XApplication.init(JSON.parse(data));
  XApplication.recompute(new AST.Address(1,3,"Data", "TestSheet"));
 
});
  }

  google.script.run.withSuccessHandler(onSuccess)
      .getData()
console.log("done");
</script>

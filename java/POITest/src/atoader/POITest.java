package atoader;

import java.io.IOException;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;

public class POITest {
	public static void main(String[] args) throws IOException {
		Workbook wb = new HSSFWorkbook();
		// Workbook wb = new XSSFWorkbook();
		Sheet sheet = wb.createSheet("new sheet");

		// Create a row and put some cells in it. Rows are 0 based.
		Row row = sheet.createRow((short) 0);
		// Create a cell and put a value in it.
		Cell cell = row.createCell(0);
		cell.setCellValue(1);
		row.createCell(1).setCellValue(1);
		row.getCell(1).setCellFormula("A1+5");
		// Or do it on one line.
		StringBuilder builder = new StringBuilder();
		final long startTime = System.currentTimeMillis();
		for (int i = 0; i < 100000; i++) {
			cell.setCellValue(i);
			wb.getCreationHelper().createFormulaEvaluator().evaluateAll();
			// builder.append(row.getCell(1).getNumericCellValue() +"\n");
		}
		final long endTime = System.currentTimeMillis();

		System.out.println(builder.toString());
		System.out.println("Total execution time: "
				+ ((double) (endTime - startTime)) / 1000);

	}
}

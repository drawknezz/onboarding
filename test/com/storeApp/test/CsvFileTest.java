package com.storeApp.test;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.security.InvalidParameterException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import main.java.com.store.manager.CsvFile;

import org.apache.commons.csv.CSVRecord;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;


public class CsvFileTest {
	CsvFile csvFile;
	String existingFileName;
	String nonExistingFileName;
	Logger logger = LogManager.getLogger(CsvFileTest.class.getName());
	
	@Before
	public void init(){
		csvFile = new CsvFile();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
		String date = sdf.format(new Date());
		existingFileName = "testCsvFile" + date + ".csv";
		nonExistingFileName = "testNonExistingCsvFile" + date + ".csv";
	}
	
	@After
	public void cleanUp(){
		File csv = new File(existingFileName);
		File csvne = new File(nonExistingFileName);
		if(csv.isFile() && csv.canWrite()){
			csv.delete();
		}
		if(csvne.isFile() && csvne.canWrite()){
			csvne.delete();
		}
	}
	
	@Test(expected=InvalidParameterException.class)
	public void openFileNullTest() throws FileNotFoundException{
		csvFile.setFilename(null);
	}
	
	@Test(expected=InvalidParameterException.class)
	public void openFileEmptyStringTest() throws FileNotFoundException{
		//Empty string should return false
		csvFile.setFilename("");
	}
	
	@Test
	public void getRecordsWithoutOpeningFileTest(){
		assertNull(csvFile.getRecords());
	}
	
	@Test
	public void getRecordsFromExistingFileTest() throws FileNotFoundException{
		PrintWriter csv = new PrintWriter(existingFileName);
		csv.println("Nombre;Apellido;Puntaje");
		csv.println("Felipe;Ordoñez;100");
		csv.println("Jorge;Campos;23");
		csv.println("Daniela;Orellana;45");
		csv.println("Jose;Manriquez;54");
		csv.close();
		
		csvFile.setFilename(existingFileName);
		Iterable<CSVRecord> recs = csvFile.getRecords();
		assertNotNull(recs);
		
		logger.debug("Obtained records: ");
		for(CSVRecord rec : recs){
			logger.debug(rec);
		}
	}
	
	@Test
	public void writeRecordTest(){
		List<String[]> records = new ArrayList<String[]>();
		records.add(new String[] {"Nombre", "Edad", "puntaje"});
		records.add(new String[] {"Marco", "23", "5"});
		records.add(new String[] {"Felipe", "24", "100"});
		records.add(new String[] {"Jessica", "17", "78"});
		records.add(new String[] {"Marcela", "21", "67"});
		
		logger.debug("writting records...");
		
		csvFile.setFilename(nonExistingFileName);
		
		csvFile.writeRecords(records, null);
	}
}

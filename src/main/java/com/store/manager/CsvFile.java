package main.java.com.store.manager;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class CsvFile {
	Logger logger = LogManager.getLogger(CsvFile.class.getName());
	String fileName = "";

	public CsvFile(String fileName){
		this.fileName = fileName;
	}
	
	public CsvFile(){}
	
	public void setFilename(String fileName) {
		if (fileName == null) {
			throw new InvalidParameterException("Parameter fileName must not be null");
		}

		if ("".equals(fileName)) {
			throw new InvalidParameterException("Parameter fileName must not be an empty string");
		}

		this.fileName = fileName;
	}

	public List<CSVRecord> getRecords() {
		if("".equals(this.fileName)){
			logger.error("This instance of CsvFile haven't had a filename specified.");
			return null;
		}
		
		File file = null;
		FileReader fr = null;
		List<CSVRecord> records = new ArrayList<CSVRecord>();
		try {
			file = new File(this.fileName);
			fr = new FileReader(file);
			
			
			if(fr != null && fr.ready()){
				for(CSVRecord rec : CSVFormat.newFormat(';').parse(fr)){
					records.add(rec);
				}
			}
			
			fr.close();
		} catch (IOException e) {
			logger.error("IOException occured while trying to read from the file " + this.fileName, e);
		} finally {
			try {
				fr.close();
			} catch (IOException e) {}
		}
		
		return records;
	}

	public void writeRecords(Iterable<String[]> records, Appendable writer) {
		Appendable w = null;
		CSVPrinter pr = null;
		
		try {
			if(writer != null){
				w = writer;
			}else{
				w = new OutputStreamWriter(new FileOutputStream(this.fileName), "utf-8");
			}
			pr = new CSVPrinter(w, CSVFormat.DEFAULT.withDelimiter(';'));
			
			pr.printRecords(records);
			
			pr.close();
		} catch (IOException e) {
			logger.error("There was an error writing the csv file.", e);
		} finally {
			try {
				pr.close();
			} catch (IOException e) {
				logger.error("There was an error closing the csv printer.", e);
			}
		}
	}
}

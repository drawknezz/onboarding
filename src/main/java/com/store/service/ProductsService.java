package main.java.com.store.service;

import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.List;

import main.java.com.store.dto.ProductDTO;
import main.java.com.store.manager.CsvFile;
import main.java.com.store.manager.ProductsMgr;
import main.java.com.store.resources.mappers.ProductExample;

import org.apache.ibatis.exceptions.PersistenceException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductsService {
	private final static Logger logger = LogManager.getLogger(ProductsService.class.getName());
	
	@Autowired
	ProductsMgr manager;
	
	public List<ProductDTO> getProducts(ProductExample example){
		if(example == null){
			throw new InvalidParameterException("Parameter example can't be null.");
		}
		
		return manager.getProducts(example);
	}

	public Long createProduct(ProductDTO product) throws PersistenceException{
		return manager.createProduct(product);
	}
	
	public Integer updateProduct(ProductDTO prod, ProductExample example) throws PersistenceException{
		return manager.updateProduct(prod, example);
	}
	
	public Integer deleteProduct(ProductExample example){
		return manager.deleteProduct(example);
	}
	
	public void getProductsCsv(Appendable writer){
		if(writer == null){
			throw new InvalidParameterException("A writer must be specified to write the csv records.");
		}
		
		CsvFile csv = new CsvFile();
		List<String[]> prodList = new ArrayList<String[]>();
		
		List<ProductDTO> products = getProducts(new ProductExample());
		for(ProductDTO p : products){
			prodList.add(p.getValuesArray());
		}
		
		logger.debug("writing " + prodList.size() + " records to csv file.");
		csv.writeRecords(prodList, writer);
	}
}

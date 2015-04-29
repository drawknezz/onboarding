package main.java.com.store.controller;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.math.BigDecimal;
import java.util.List;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import main.java.com.store.dto.ProductDTO;
import main.java.com.store.exceptions.ProductAleradyExistsException;
import main.java.com.store.resources.mappers.ProductExample;
import main.java.com.store.service.ProductsService;

import org.apache.ibatis.exceptions.PersistenceException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.postgresql.util.PSQLException;
import org.postgresql.util.ServerErrorMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductsController {
	
	@Autowired
	ProductsService service;
	
	Logger logger = LogManager.getLogger(ProductsController.class.getName());
	
	@RequestMapping(method=RequestMethod.GET, value="/product")
	public List<ProductDTO> getProducts(
			@RequestParam(value="id", required=false) Long id,
			@RequestParam(value="name", required=false) String name,
			@RequestParam(value="price", required=false) BigDecimal price,
			@RequestParam(value="description", required=false) String description,
			@RequestParam(value="stock", required=false) Integer stock
		){
		ProductExample example = new ProductExample();
		ProductExample.Criteria criteria = example.createCriteria();
		
		if(id != null) criteria.andIdEqualTo(id);
		if(name != null) criteria.andNameEqualTo(name);
		if(price != null) criteria.andPriceEqualTo(price);
		if(description != null) criteria.andDescriptionEqualTo(description);
		if(stock != null) criteria.andStockEqualTo(stock);
		
		return service.getProducts(example);
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/product")
	public Long createProduct(
			@RequestParam(value="name", required=true) String name,
			@RequestParam(value="price", required=false) BigDecimal price,
			@RequestParam(value="description", required=false) String description,
			@RequestParam(value="stock", required=false) Integer stock
		) throws Exception{
		
		logger.debug("getting products (Ctrl)");
		Long newId = 0L;
		try{
			newId = service.createProduct(new ProductDTO(null, name, price, description, stock));
		}catch(PersistenceException ex){
			PSQLException pex = (PSQLException) ex.getCause();
			ServerErrorMessage sem = pex.getServerErrorMessage();
			
			String sqlState = sem.getSQLState();
			logger.debug("SQL STATE: " + sqlState);
			
			switch (sqlState) {
			case "23505":
				throw new ProductAleradyExistsException("There's already a product with name \"" + name + "\", please speficy a different name");
//			case "22003":
//				throw new Exception("The number entered is too big.");
			default:
				throw new Exception("An error has ocurred: " + ex.getMessage());
			}
		}
		
		return newId;
	}
	
	@RequestMapping(method=RequestMethod.PUT, value="/product")
	public Integer updateProduct(
			@RequestParam(value="id", required=true) Long id,
			@RequestParam(value="name", required=true) String name,
			@RequestParam(value="price", required=false) BigDecimal price,
			@RequestParam(value="description", required=false) String description,
			@RequestParam(value="stock", required=false) Integer stock,
			@RequestParam(value="nid", required=false) Long new_id,
			@RequestParam(value="nname", required=false) String new_name,
			@RequestParam(value="nprice", required=false) BigDecimal new_price,
			@RequestParam(value="ndescription", required=false) String new_description,
			@RequestParam(value="nstock", required=false) Integer new_stock
		){
		ProductDTO product = new ProductDTO(new_id, new_name, new_price, new_description, new_stock);
		ProductExample example = new ProductExample();
		ProductExample.Criteria criteria = example.createCriteria();
		if(id != null) criteria.andIdEqualTo(id);
		if(name != null) criteria.andNameEqualTo(name);
		if(price != null) criteria.andPriceEqualTo(price);
		if(description != null) criteria.andDescriptionEqualTo(description);
		if(stock != null) criteria.andStockEqualTo(stock);
		
		product.setId(id);
		return service.updateProduct(product, example);
	}
	
	@RequestMapping(method=RequestMethod.DELETE, value="/product")
	public Integer product(
			@RequestParam(value="id", required=true) Long id,
			@RequestParam(value="name", required=true) String name,
			@RequestParam(value="price", required=false) BigDecimal price,
			@RequestParam(value="description", required=false) String description,
			@RequestParam(value="stock", required=false) Integer stock
		){
		ProductExample example = new ProductExample();
		ProductExample.Criteria criteria = example.createCriteria();
		if(id != null) criteria.andIdEqualTo(id);
		if(name != null) criteria.andNameEqualTo(name);
		if(price != null) criteria.andPriceEqualTo(price);
		if(description != null) criteria.andDescriptionEqualTo(description);
		if(stock != null) criteria.andStockEqualTo(stock);
		return service.deleteProduct(example);
	}
	
	@RequestMapping(method=RequestMethod.GET, value="/productscsv")
	public void productsCSV(@RequestParam(value="filename", required=false) String filename, HttpServletResponse response){
		try {
			ServletOutputStream os = response.getOutputStream();
			
			String fn = filename != null? filename + ".csv" : "products.csv";
			logger.debug("sending csv file with name" + fn);
			response.addHeader("Content-type", "text/csv");
			response.addHeader("Content-Disposition", "attachment;filename=" + fn);
			
			service.getProductsCsv(new OutputStreamWriter(os));
			
			response.flushBuffer();
		} catch (IOException e) {
			logger.error("An error has occured while trying to write the csv file.", e);
		}
	}
}

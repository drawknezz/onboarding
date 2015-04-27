package main.java.com.store.service;

import java.security.InvalidParameterException;
import java.util.List;

import main.java.com.store.dto.ProductDTO;
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
}

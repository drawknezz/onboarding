package com.storeApp.test;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

import java.io.IOException;
import java.math.BigDecimal;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import main.java.com.store.StoreApp;
import main.java.com.store.dto.ProductDTO;
import main.java.com.store.manager.ProductsMgr;
import main.java.com.store.resources.mappers.ProductExample;

import org.apache.ibatis.exceptions.PersistenceException;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;

public class ProductsMgrTest {
	Logger logger = LogManager.getLogger(ProductsMgrTest.class.getName());
	
	@InjectMocks
	private ProductsMgr mgr;
	
	@Spy
	private SqlSessionFactory sqlsessionFactory;
	
	@Before
	public void init() throws IOException{
		sqlsessionFactory = StoreApp.getSqlSessionFactory();
		
		MockitoAnnotations.initMocks(this);
	}
	
	@Test
	public void getProductsNoCriteriaTest(){
		List<ProductDTO> products = mgr.getProducts(new ProductExample());
		
		List<String> prods = new ArrayList<String>();
		for(ProductDTO prod : products){
			prods.add(prod.getShortDescription());
		}
		
		logger.debug("all products: " + prods);
	}
	
	@Test
	public void getProductsByIdTest(){
		Long id = 17L;
		
		ProductExample example = new ProductExample();
		ProductExample.Criteria criteria = example.createCriteria(); 
		criteria.andIdEqualTo(id);
		
		List<ProductDTO> products = mgr.getProducts(example);
		
		List<String> prods = new ArrayList<String>();
		for(ProductDTO prod : products){
			prods.add(prod.getShortDescription());
		}
		
		logger.debug("Products with id " + id + ": " + prods);
	}
	
	@Test(expected=InvalidParameterException.class)
	public void createProductNullTest(){
		Long newId = mgr.createProduct(null);
		logger.debug("New product Id: " + newId);
	}
	
	@Test(expected=PersistenceException.class)
	public void createExistingProductTest(){
		List<ProductDTO> products = mgr.getProducts(new ProductExample());
		if(products.size() <= 0) return;
		
		ProductDTO prod = new ProductDTO(null, products.get(0).getName(), BigDecimal.valueOf(3456), "test product number 1", 76);
		Long newId = mgr.createProduct(prod);
		logger.debug("New product Id: " + newId);
	}
	
	@Test
	public void createNonexistingProductTest(){
		List<ProductDTO> products = mgr.getProducts(new ProductExample());
		if(products.size() <= 0) return;
		
		String name = "";
		Boolean exists = true;
		while(exists){
			for(int i = 0; i < 5; i++){
				name += (new String[]{"A", "B", "C", "D", "E", "F", "G", "H", "I", "J"})[Integer.parseInt(String.valueOf(Math.round(Math.random()*9)))];
			}
			for(ProductDTO prod : products){
				if(name.equals(prod.getName())){
					break;
				}
			}
			exists = false;
		}
		
		ProductDTO prod = new ProductDTO(null, name, BigDecimal.valueOf(Math.round(Math.random()*1000)), "test product number 1", Integer.valueOf(String.valueOf(Math.round(Math.random()*100))));
		Long newId = mgr.createProduct(prod);
		logger.debug("New product Id: " + newId);
	}
	
	@Test(expected=PersistenceException.class)
	public void updateExistingProductTest(){
		List<ProductDTO> products = mgr.getProducts(new ProductExample());
		if(products.size() <= 0) return;
		
		ProductDTO prod = new ProductDTO(null, "updatedProd", BigDecimal.valueOf(999), "updated product number 1", 997);
		
		ProductExample example = new ProductExample();
		ProductExample.Criteria criteria = example.createCriteria();
		criteria.andIdEqualTo(products.get(0).getId());
		Integer num = mgr.updateProduct(prod, example);

		logger.debug("Updated products: " + num);
		assertThat("num should be greater than zero", num > 0, is(true));
	}
	
	@Test
	public void updateUnexistingProductTest(){
		List<ProductDTO> products = mgr.getProducts(new ProductExample());
		if(products.size() <= 0) return;
		
		products.sort(new Comparator<ProductDTO>() {
			@Override
			public int compare(ProductDTO o1, ProductDTO o2) {
				return o1.getId() > o2.getId() ? 1 : o1.getId() == o2.getId()? 0: -1;
			}
		});
		
		ProductDTO prod = new ProductDTO(null, "updatedProd", BigDecimal.valueOf(999), "updated product number 1", 997);
		
		ProductExample example = new ProductExample();
		ProductExample.Criteria criteria = example.createCriteria();
		criteria.andIdEqualTo(products.get(products.size()-1).getId() + 1);
		
		Integer num = mgr.updateProduct(prod, example);
		logger.debug("Updated products: " + num);
		assertThat("num should be zero", num == 0, is(true));
	}
	
	@Test
	public void deleteExistingProductTest(){
		List<ProductDTO> products = mgr.getProducts(new ProductExample());
		if(products.size() <= 0) return;
		
		products.sort(new Comparator<ProductDTO>() {
			@Override
			public int compare(ProductDTO o1, ProductDTO o2) {
				return o1.getId() > o2.getId() ? 1 : o1.getId() == o2.getId()? 0: -1;
			}
		});
		
		ProductExample example = new ProductExample();
		ProductExample.Criteria criteria = example.createCriteria();
		criteria.andIdEqualTo(products.get(products.size()-1).getId());
		
		Integer num = mgr.deleteProduct(example);
		logger.debug("Deleted products: " + num);
		assertThat("num should be greater than zero", num >= 0, is(true));
	}
	
	@Test
	public void deleteNonExistingProductTest(){
		List<ProductDTO> products = mgr.getProducts(new ProductExample());
		if(products.size() <= 0) return;
		
		products.sort(new Comparator<ProductDTO>() {
			@Override
			public int compare(ProductDTO o1, ProductDTO o2) {
				return o1.getId() > o2.getId() ? 1 : o1.getId() == o2.getId()? 0: -1;
			}
		});
		
		ProductExample example = new ProductExample();
		ProductExample.Criteria criteria = example.createCriteria();
		criteria.andIdEqualTo(products.get(products.size()-1).getId()+1);
		Integer num = mgr.deleteProduct(example);

		logger.debug("Deleted products: " + num);
		assertThat("num should be zero", num == 0, is(true));
	}
}

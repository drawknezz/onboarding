package main.java.com.store.manager;

import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.List;

import main.java.com.store.dto.ProductDTO;
import main.java.com.store.resources.dao.ProductMapper;
import main.java.com.store.resources.mappers.Product;
import main.java.com.store.resources.mappers.ProductExample;

import org.apache.ibatis.exceptions.PersistenceException;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProductsMgr {
	private final static Logger logger = LogManager.getLogger(ProductsMgr.class.getName());

	@Autowired
	SqlSessionFactory sqlsessionFactory;
	
	public List<ProductDTO> getProducts(ProductExample example){
		logger.debug("Getting list of Products");
		
		SqlSession session = sqlsessionFactory.openSession();
		ProductMapper mapper = session.getMapper(ProductMapper.class);
		List<Product> productsDao = mapper.selectByExample(example);
		
		List<ProductDTO> products = new ArrayList<ProductDTO>();
		for(Product pro : productsDao){
			ProductDTO dto = new ProductDTO();
			
			dto.setId(pro.getId());
			dto.setName(pro.getName());
			dto.setPrice(pro.getPrice());
			dto.setDescription(pro.getDescription());
			dto.setStock(pro.getStock());
			
			products.add(dto);
		}
		
		session.close();
		return products;
	}
	
	public Long createProduct(ProductDTO product) throws PersistenceException{
		if(product == null){
			throw new InvalidParameterException("product can't be null");
		}
		
		logger.debug("Creating product");

		Product productDao = new Product();
		productDao.setId(product.getId());
		productDao.setName(product.getName());
		productDao.setPrice(product.getPrice());
		productDao.setDescription(product.getDescription());
		productDao.setStock(product.getStock());
		
		SqlSession session = sqlsessionFactory.openSession();
		ProductMapper mapper = session.getMapper(ProductMapper.class);
		mapper.insertSelective(productDao);
		
		session.commit();
		
		session.close();
		return productDao.getId();
	}
	
	public Integer updateProduct(ProductDTO prod, ProductExample example) throws PersistenceException{
		Product productDao = new Product();
		productDao.setId(prod.getId());
		productDao.setName(prod.getName());
		productDao.setPrice(prod.getPrice());
		productDao.setDescription(prod.getDescription());
		productDao.setStock(prod.getStock());
		
		SqlSession session = sqlsessionFactory.openSession();
		ProductMapper mapper = session.getMapper(ProductMapper.class);
		
		Integer num = mapper.updateByExampleSelective(productDao, example);
		
		session.commit();
		
		session.close();
		return num;
	}
	
	public Integer deleteProduct(ProductExample example) {
		SqlSession session = sqlsessionFactory.openSession();
		ProductMapper mapper = session.getMapper(ProductMapper.class);
		
		Integer num = mapper.deleteByExample(example);
		
		session.commit();
		
		session.close();
		return num;
	}
	
}

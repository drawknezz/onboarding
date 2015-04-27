package main.java.com.store.dto;

import java.math.BigDecimal;

public class ProductDTO {
	private Long id;
	private String name;
	private BigDecimal price;
	private String description;
	private Integer stock;
	
	public ProductDTO(){}
	
	public ProductDTO(Long id, String name, BigDecimal price, String description, Integer stock){
		this.id = id;
		this.name = name;
		this.price = price;
		this.description = description;
		this.stock = stock;
	}
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public BigDecimal getPrice() {
		return price;
	}
	public void setPrice(BigDecimal price) {
		this.price = price;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public Integer getStock() {
		return stock;
	}
	public void setStock(Integer stock) {
		this.stock = stock;
	}
	
	@Override
	public String toString() {
		return "ProductDTO [id=" + id + ", name=" + name + ", price=" + price
				+ ", description=" + description + ", stock=" + stock + "]";
	}
	
	public String getShortDescription(){
		return "{" + this.description + ", " + this.price + "}";
	}
}

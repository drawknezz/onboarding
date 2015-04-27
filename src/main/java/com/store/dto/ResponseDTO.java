package main.java.com.store.dto;

public class ResponseDTO {
	private String response;
	private Boolean isError;
	
	public ResponseDTO(String response, Boolean isError){
		this.response = response;
		this.isError = isError;
	}
	
	public String getResponse() {
		return response;
	}
	public void setResponse(String response) {
		this.response = response;
	}
	public Boolean getIsError() {
		return isError;
	}
	public void setIsError(Boolean isError) {
		this.isError = isError;
	}
	
	@Override
	public String toString() {
		return "ResponseDTO [response=" + response + ", isError=" + isError
				+ "]";
	}
	
}

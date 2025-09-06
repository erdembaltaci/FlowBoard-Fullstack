// JiraProject.Business/Abstract/IGenericRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;


namespace JiraProject.Business.Abstract
{
    public interface IGenericRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task AddAsync(T entity);
        void Update(T entity);
        Task<T?> GetByIdWithIncludesAsync(int id, params string[] includeStrings);
        IQueryable<T> GetQueryableWithIncludes(params string[] includeStrings);
        Task<IEnumerable<T>> FindWithIncludesAsync(Expression<Func<T, bool>> predicate, params string[] includeStrings);
        Task<int> CountAsync(Expression<Func<T, bool>> predicate);
        void Delete(T entity);
        void Remove(T entity);
    }
}
